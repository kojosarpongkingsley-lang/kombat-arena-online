import { Howl } from 'howler';

class SoundManagerImpl {
  private sounds: Map<string, Howl> = new Map();
  private music: Howl | null = null;
  private muted: boolean = false;

  constructor() {
    this.loadSounds();
  }

  private loadSounds() {
    // High quality fighting game assets
    const assets = {
      punch: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      kick: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      jump: 'https://assets.mixkit.co/active_storage/sfx/2593/2593-preview.mp3',
      hit: 'https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3',
      victory: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    };

    Object.entries(assets).forEach(([key, url]) => {
      this.sounds.set(key, new Howl({ src: [url], volume: 0.5 }));
    });

    this.music = new Howl({
      src: ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3'],
      loop: true,
      volume: 0.3,
      html5: true
    });
  }

  public play(key: string) {
    if (this.muted) return;
    this.sounds.get(key)?.play();
  }

  public playMusic() {
    if (this.muted || !this.music) return;
    if (!this.music.playing()) {
      this.music.play();
    }
  }

  public setMute(muted: boolean) {
    this.muted = muted;
    if (this.music) {
      this.music.mute(muted);
    }
    this.sounds.forEach(s => s.mute(muted));
  }
}

export const SoundManager = new SoundManagerImpl();