import Phaser from 'phaser';
import { SoundManager } from './SoundManager';

type Controls = {
  up: string;
  down: string;
  left: string;
  right: string;
  punch: string;
  kick: string;
};

export class Fighter extends Phaser.Physics.Arcade.Sprite {
  public health: number = 100;
  public isAttacking: boolean = false;
  public hasHit: boolean = false;
  public currentDamage: number = 0;
  
  private keys: any;
  private label: Phaser.GameObjects.Text;
  private attackCooldown: number = 0;
  private name: string;
  private isAI: boolean = false;
  private aiActionTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, name: string, color: number, controls: Controls) {
    super(scene, x, y, '');
    
    this.name = name;
    this.isAI = (name === 'P2'); // Simple rule: P2 is AI
    
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDragX(2000);
    this.setBodySize(60, 140);

    // Visuals: Creating a more "character" look with graphics
    const graphics = scene.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, 60, 140);
    // Add "eyes" to indicate direction
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(40, 20, 15, 10); // Right facing eye
    
    const textureKey = `tex_${name}`;
    graphics.generateTexture(textureKey, 60, 140);
    graphics.destroy();
    this.setTexture(textureKey);

    this.label = scene.add.text(x, y - 90, name, { fontSize: '18px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    
    this.keys = scene.input.keyboard?.addKeys(controls);
  }

  reset(x: number, y: number) {
    this.health = 100;
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.isAttacking = false;
    this.hasHit = false;
    this.clearTint();
    this.setScale(1, 1);
    this.setAngle(0);
  }

  update(opponent?: Fighter) {
    this.label.setPosition(this.x, this.y - 90);

    if (this.health <= 0) {
      this.setTint(0x333333);
      return;
    }

    if (this.isAI && opponent) {
      this.handleAI(opponent);
    } else {
      this.handleInput();
    }

    // Reset attack state
    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }
  }

  private handleInput() {
    // Movement
    if (this.keys.left.isDown) {
      this.setVelocityX(-450);
      this.flipX = true;
    } else if (this.keys.right.isDown) {
      this.setVelocityX(450);
      this.flipX = false;
    }

    // Jump
    if (this.keys.up.isDown && this.body?.blocked.down) {
      this.setVelocityY(-850);
      SoundManager.play('jump');
    }

    // Attacks
    if (this.attackCooldown <= 0) {
      if (this.keys.punch.isDown) {
        this.performAttack('punch', 8);
      } else if (this.keys.kick.isDown) {
        this.performAttack('kick', 12);
      }
    }
  }

  private handleAI(opponent: Fighter) {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, opponent.x, opponent.y);
    
    // AI decision making every few frames
    if (this.scene.time.now > this.aiActionTimer) {
      this.aiActionTimer = this.scene.time.now + Phaser.Math.Between(200, 500);

      if (dist > 150) {
        // Move towards opponent
        if (opponent.x < this.x) {
          this.setVelocityX(-300);
          this.flipX = true;
        } else {
          this.setVelocityX(300);
          this.flipX = false;
        }
      } else {
        // Attack if close
        if (Math.random() > 0.5) {
          this.performAttack(Math.random() > 0.5 ? 'punch' : 'kick', 10);
        }
      }

      // Occasional jump
      if (Math.random() > 0.9 && this.body?.blocked.down) {
        this.setVelocityY(-800);
      }
    }
  }

  performAttack(type: 'punch' | 'kick', damage: number) {
    if (this.isAttacking) return;

    this.isAttacking = true;
    this.hasHit = false;
    this.currentDamage = damage;
    this.attackCooldown = 40;

    // Visual effect
    this.setTint(0xffaa00);
    SoundManager.play(type === 'punch' ? 'punch' : 'kick');

    this.scene.time.delayedCall(250, () => {
      this.isAttacking = false;
      this.clearTint();
    });
  }

  takeDamage(amount: number) {
    this.health -= amount;
    this.setTint(0xff0000);
    SoundManager.play('hit');
    
    // Flash white
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 50,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.alpha = 1;
        if (this.health > 0) this.clearTint();
      }
    });

    if (this.health <= 0) {
      this.die();
    }
  }

  private die() {
    this.setVelocity(0, 0);
    this.setTint(0x222222);
    this.scene.tweens.add({
      targets: this,
      angle: 90,
      y: this.y + 40,
      duration: 500,
      ease: 'Bounce'
    });
  }
}