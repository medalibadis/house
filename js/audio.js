/**
 * Ambient Wedding Music Controller
 * Dual Engine: High-fidelity acoustic oriental wedding instrumental (assets/music.mp3)
 * with automatic fallback to Web Audio API synthesized ambient harp.
 */

class AmbientMusicController {
  constructor() {
    this.isPlaying = false;
    this.audioElement = null;
    this.useAudioElement = true;

    // Web Audio Fallback state
    this.ctx = null;
    this.masterGain = null;
    this.synthTimer = null;

    // Warm Arabic Bayati / Hijaz notes for synthesis fallback
    this.notes = [
      146.83, // D3
      174.61, // F3
      196.00, // G3
      220.00, // A3
      233.08, // Bb3
      261.63, // C4
      293.66, // D4
      329.63, // E4
      349.23, // F4
      392.00, // G4
      440.00, // A4
      523.25, // C5
      587.33  // D5
    ];

    this.sequence = [
      { note: 0, dur: 2.0, delay: 0 },
      { note: 3, dur: 1.5, delay: 0.35 },
      { note: 6, dur: 1.5, delay: 0.7 },
      { note: 8, dur: 1.8, delay: 1.05 },
      { note: 10, dur: 2.4, delay: 1.4 },
      
      { note: 2, dur: 2.0, delay: 2.4 },
      { note: 5, dur: 1.5, delay: 2.75 },
      { note: 7, dur: 1.5, delay: 3.1 },
      { note: 9, dur: 1.8, delay: 3.45 },
      { note: 11, dur: 2.6, delay: 3.8 },

      { note: 4, dur: 2.0, delay: 4.8 },
      { note: 6, dur: 1.5, delay: 5.15 },
      { note: 8, dur: 1.5, delay: 5.5 },
      { note: 10, dur: 1.8, delay: 5.85 },
      { note: 12, dur: 2.8, delay: 6.2 },

      { note: 3, dur: 2.2, delay: 7.2 },
      { note: 6, dur: 1.8, delay: 7.6 },
      { note: 9, dur: 2.0, delay: 8.0 },
      { note: 10, dur: 3.4, delay: 8.4 }
    ];

    this.loopDuration = 9.8 * 1000;

    this.initAudioElement();
  }

  initAudioElement() {
    try {
      this.audioElement = new Audio('assets/music.mp3');
      this.audioElement.loop = true;
      this.audioElement.preload = 'auto';
      this.audioElement.volume = 0.65;

      this.audioElement.addEventListener('error', () => {
        // Fallback to Web Audio synthesis if MP3 fails to load
        this.useAudioElement = false;
      });
    } catch (e) {
      this.useAudioElement = false;
    }
  }

  /* Web Audio Synthesizer Fallback */
  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(1500, this.ctx.currentTime);

      this.filter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPluck(freq, duration, delayTime = 0) {
    if (!this.ctx || !this.isPlaying) return;

    const startTime = this.ctx.currentTime + delayTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(noteGain);
    osc2.connect(noteGain);
    noteGain.connect(this.filter);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration + 0.1);
    osc2.stop(startTime + duration + 0.1);
  }

  startSynthLoop() {
    if (!this.isPlaying) return;

    this.sequence.forEach(item => {
      const freq = this.notes[item.note];
      this.playPluck(freq, item.dur, item.delay);
    });

    this.synthTimer = setTimeout(() => {
      if (this.isPlaying) {
        this.startSynthLoop();
      }
    }, this.loopDuration);
  }

  play() {
    this.isPlaying = true;

    if (this.useAudioElement && this.audioElement) {
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // In case of browser autoplay or load restrictions, run Web Audio fallback
          this.initContext();
          this.startSynthLoop();
        });
      }
    } else {
      this.initContext();
      this.startSynthLoop();
    }
  }

  pause() {
    this.isPlaying = false;

    if (this.audioElement) {
      this.audioElement.pause();
    }

    if (this.synthTimer) {
      clearTimeout(this.synthTimer);
      this.synthTimer = null;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }
}

window.ambientMusic = new AmbientMusicController();
