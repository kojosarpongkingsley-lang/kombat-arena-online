import Phaser from 'phaser';
import { Fighter } from './Fighter';
import { SoundManager } from './SoundManager';

export class GameScene extends Phaser.Scene {
  private player1!: Fighter;
  private player2!: Fighter;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private timerText!: Phaser.GameObjects.Text;
  private gameTime: number = 99;
  private timerEvent!: Phaser.Time.TimerEvent;
  private isGameOver: boolean = false;

  private p1HealthBar!: Phaser.GameObjects.Rectangle;
  private p2HealthBar!: Phaser.GameObjects.Rectangle;

  constructor() {
    super('GameScene');
  }

  create() {
    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x220000, 0x220000, 0x000000, 0x000000, 1);
    bg.fillRect(0, 0, 1024, 576);

    // Decorative Pillars
    for (let i = 0; i < 5; i++) {
        this.add.rectangle(i * 250, 0, 80, 576, 0x111111).setOrigin(0, 0).setAlpha(0.5);
    }

    // Floor
    this.platforms = this.physics.add.staticGroup();
    const floor = this.add.rectangle(512, 540, 1024, 80, 0x222222).setStrokeStyle(4, 0x660000);
    this.platforms.add(floor);

    // Players
    this.player1 = new Fighter(this, 250, 450, 'P1', 0xff3333, {
      up: 'W', down: 'S', left: 'A', right: 'D', punch: 'F', kick: 'G'
    });
    
    this.player2 = new Fighter(this, 774, 450, 'P2', 0x3333ff, {
      up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT', punch: 'K', kick: 'L'
    });

    // Collisions
    this.physics.add.collider(this.player1, this.platforms);
    this.physics.add.collider(this.player2, this.platforms);
    this.physics.add.collider(this.player1, this.player2);

    this.setupHUD();

    this.game.events.on('start-game', this.startGame, this);
    this.game.events.on('restart-game', this.restartGame, this);

    this.scene.pause();
  }

  setupHUD() {
    // Bars
    this.add.rectangle(250, 60, 400, 40, 0x000000, 0.5).setStrokeStyle(2, 0xffffff);
    this.add.rectangle(774, 60, 400, 40, 0x000000, 0.5).setStrokeStyle(2, 0xffffff);

    this.p1HealthBar = this.add.rectangle(250, 60, 396, 36, 0x00ff00);
    this.p2HealthBar = this.add.rectangle(774, 60, 396, 36, 0x00ff00);

    this.timerText = this.add.text(512, 60, '99', {
      fontSize: '54px',
      fontStyle: 'bold italic',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);
  }

  startGame() {
    this.scene.resume();
    this.isGameOver = false;
    this.gameTime = 99;
    this.player1.reset(250, 450);
    this.player2.reset(774, 450);
    
    if (this.timerEvent) this.timerEvent.destroy();
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.gameTime > 0) {
          this.gameTime--;
          this.timerText.setText(this.gameTime.toString());
        } else {
          this.checkWinner();
        }
      },
      loop: true
    });
  }

  restartGame() {
    this.startGame();
  }

  update() {
    if (this.isGameOver) return;

    this.player1.update(this.player2);
    this.player2.update(this.player1);

    this.handleCombat(this.player1, this.player2);
    this.handleCombat(this.player2, this.player1);

    // Update Bars
    this.p1HealthBar.width = Math.max(0, (this.player1.health / 100) * 396);
    this.p2HealthBar.width = Math.max(0, (this.player2.health / 100) * 396);
    
    // Color health bars
    if (this.player1.health < 30) this.p1HealthBar.setFillStyle(0xff0000);
    if (this.player2.health < 30) this.p2HealthBar.setFillStyle(0xff0000);

    if (this.player1.health <= 0 || this.player2.health <= 0) {
      this.checkWinner();
    }
  }

  handleCombat(attacker: Fighter, defender: Fighter) {
    if (attacker.isAttacking && !attacker.hasHit) {
      const distance = Phaser.Math.Distance.Between(attacker.x, attacker.y, defender.x, defender.y);
      const isFacing = (attacker.flipX && defender.x < attacker.x) || (!attacker.flipX && defender.x > attacker.x);

      if (distance < 100 && isFacing) {
        defender.takeDamage(attacker.currentDamage);
        attacker.hasHit = true;
        this.cameras.main.shake(100, 0.005);
      }
    }
  }

  checkWinner() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.timerEvent.destroy();
    
    let winner = 'Player 1';
    if (this.player1.health < this.player2.health) winner = 'Player 2';
    
    SoundManager.play('victory');
    window.dispatchEvent(new CustomEvent('gameover', { detail: { winner } }));
  }
}