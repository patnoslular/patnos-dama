
class SoundService {
  private moveSound: HTMLAudioElement;
  private captureSound: HTMLAudioElement;
  private kingSound: HTMLAudioElement;
  private winSound: HTMLAudioElement;
  private loseSound: HTMLAudioElement;

  constructor() {
    // Using reliable public assets
    this.moveSound = new Audio('https://raw.githubusercontent.com/lichess-org/lila/master/public/sound/standard/Move.ogg');
    this.captureSound = new Audio('https://raw.githubusercontent.com/lichess-org/lila/master/public/sound/standard/Capture.ogg');
    this.kingSound = new Audio('https://raw.githubusercontent.com/lichess-org/lila/master/public/sound/standard/GenericNotify.ogg');
    this.winSound = new Audio('https://raw.githubusercontent.com/lichess-org/lila/master/public/sound/standard/Victory.ogg');
    this.loseSound = new Audio('https://raw.githubusercontent.com/lichess-org/lila/master/public/sound/standard/Defeat.ogg');

    // Preload
    [this.moveSound, this.captureSound, this.kingSound, this.winSound, this.loseSound].forEach(s => {
      s.load();
      s.volume = 0.5;
    });
  }

  playMove() {
    this.moveSound.currentTime = 0;
    this.moveSound.play().catch(() => {});
  }

  playCapture() {
    this.captureSound.currentTime = 0;
    this.captureSound.play().catch(() => {});
  }

  playKing() {
    this.kingSound.currentTime = 0;
    this.kingSound.play().catch(() => {});
  }

  playWin() {
    this.winSound.currentTime = 0;
    this.winSound.play().catch(() => {});
  }

  playLose() {
    this.loseSound.currentTime = 0;
    this.loseSound.play().catch(() => {});
  }
}

export const soundService = new SoundService();
