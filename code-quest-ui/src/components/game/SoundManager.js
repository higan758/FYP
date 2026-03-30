import explosion from '../../assets/audio/explosion.wav';
import hurt from '../../assets/audio/hurt.wav';
import coin from '../../assets/audio/coin.wav';
import bgMusic from '../../assets/audio/time_for_adventure.mp3';

class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.5;

    this.loadSound('explosion', explosion);
    this.loadSound('hurt', hurt);
    this.loadSound('coin', coin);

    this.bgMusic = new Audio(bgMusic);
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.3;
    this.bgMusic.preload = 'auto';
  }

  loadSound(name, src) {
    try {
      this.sounds[name] = src;
    } catch (error) {
      console.warn(`Failed to load sound: ${name}`, error);
    }
  }

  play(name) {
    if (!this.enabled || !this.sounds[name]) return;

    try {
      const sound = new Audio(this.sounds[name]);
      sound.preload = 'auto';
      sound.volume = this.volume;
      sound.play().catch(err => {
        console.warn(`Failed to play sound: ${name}`, err);
      });
    } catch (error) {
      console.warn(`Error playing sound: ${name}`, error);
    }
  }

  playHurt() {
    this.play('hurt');
  }

  playExplosion() {
    this.play('explosion');
  }

  playVictory() {
    this.play('coin');
  }

  playBackgroundMusic() {
    if (!this.enabled || !this.bgMusic) return;

    this.bgMusic.play().catch(err => {
      console.warn('Failed to play background music', err);
    });
  }

  stopBackgroundMusic() {
    if (!this.bgMusic) return;
    this.bgMusic.pause();
    this.bgMusic.currentTime = 0;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    }
  }

  mute() {
    this.setEnabled(false);
  }

  unmute() {
    this.enabled = true;
  }
}

const soundManager = new SoundManager();
export default soundManager;
