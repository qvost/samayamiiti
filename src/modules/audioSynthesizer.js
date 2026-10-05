// Web Audio API Synthesizer for Tibetan Singing Bowl, Clock Chime, and Ambient Ticks
class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.hourlyChimeEnabled = true;
    this.tickSoundEnabled = false;
    this.lastChimedHour = -1;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTibetanBowl(fundamental = 280, duration = 4.5) {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.connect(this.ctx.destination);
      masterGain.gain.setValueAtTime(0.4, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // Harmonics of a singing bowl: ~1.0, 2.71, 5.05, 8.12 with subtle detune beating
      const partials = [
        { freq: fundamental * 1.0, gain: 0.5, detune: 0 },
        { freq: fundamental * 1.004, gain: 0.35, detune: 2 }, // beating
        { freq: fundamental * 2.71, gain: 0.25, detune: -1 },
        { freq: fundamental * 5.05, gain: 0.12, detune: 3 },
        { freq: fundamental * 8.12, gain: 0.05, detune: 0 }
      ];

      partials.forEach(p => {
        const osc = this.ctx.createOscillator();
        const pGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(p.freq, now);
        osc.detune.setValueAtTime(p.detune, now);

        pGain.gain.setValueAtTime(p.gain, now);
        pGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * (p.gain > 0.3 ? 1.0 : 0.6));

        osc.connect(pGain);
        pGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + duration + 0.1);
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  playClockTick() {
    if (!this.tickSoundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.02);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {
      // ignore
    }
  }

  playAlarmSound() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, i) => {
        const noteTime = now + (i * 0.14);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.3, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.7);
      });
    } catch (e) {
      console.warn('Alarm audio error:', e);
    }
  }

  checkHourlyChime(currentHour, currentMinute, currentSecond) {
    if (this.hourlyChimeEnabled && currentMinute === 0 && currentSecond === 0) {
      if (this.lastChimedHour !== currentHour) {
        this.lastChimedHour = currentHour;
        this.playTibetanBowl(240, 5.0);
      }
    }
  }
}

export const soundFx = new AudioSynthesizer();
