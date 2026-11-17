/**
 * Ambient Wedding Music Generator (Web Audio API)
 * Luxury oriental harp / celestial acoustic arpeggios
 * Seamlessly loops soothing ambient wedding melody without external audio dependency.
 */

class AmbientMusicController {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.timer = null;
    this.currentStep = 0;

    // Harmonic frequencies: Soothing Arabic Bayati / Hijaz / Pentatonic hybrid scale in D/A
    // (D3, F3, G3, A3, Bb3, C4, D4, E4, F4, G4, A4, C5)
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

    // Elegant, celestial arpeggio sequence
    this.sequence = [
      { note: 0, dur: 1.8, delay: 0 },
      { note: 3, dur: 1.4, delay: 0.35 },
      { note: 6, dur: 1.4, delay: 0.7 },
      { note: 8, dur: 1.6, delay: 1.05 },
      { note: 10, dur: 2.2, delay: 1.4 },
      
      { note: 2, dur: 1.8, delay: 2.4 },
      { note: 5, dur: 1.4, delay: 2.75 },
      { note: 7, dur: 1.4, delay: 3.1 },
      { note: 9, dur: 1.6, delay: 3.45 },
      { note: 11, dur: 2.4, delay: 3.8 },

      { note: 4, dur: 1.8, delay: 4.8 },
      { note: 6, dur: 1.4, delay: 5.15 },
      { note: 8, dur: 1.4, delay: 5.5 },
      { note: 10, dur: 1.6, delay: 5.85 },
      { note: 12, dur: 2.6, delay: 6.2 },

      { note: 3, dur: 2.0, delay: 7.2 },
      { note: 6, dur: 1.6, delay: 7.6 },
      { note: 9, dur: 1.8, delay: 8.0 },
      { note: 10, dur: 3.2, delay: 8.4 }
    ];

    this.loopDuration = 9.8 * 1000;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.28, this.ctx.currentTime); // gentle ambient volume

      // Soft low-pass filter to give warm wooden harp/oud tone
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

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

    // Dual oscillator for rich, warm plucked acoustic string resonance
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime); // Harmonic octave shimmer

    // Realistic plucked string ADSR curve
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(0.18, startTime + 0.02); // quick pluck attack
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); // gentle exponential decay

    osc1.connect(noteGain);
    osc2.connect(noteGain);
    noteGain.connect(this.filter);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration + 0.1);
    osc2.stop(startTime + duration + 0.1);
  }

  startSequenceLoop() {
    if (!this.isPlaying) return;

    // Schedule all notes in this loop cycle
    this.sequence.forEach(item => {
      const freq = this.notes[item.note];
      this.playPluck(freq, item.dur, item.delay);
    });

    // Schedule next cycle
    this.timer = setTimeout(() => {
      if (this.isPlaying) {
        this.startSequenceLoop();
      }
    }, this.loopDuration);
  }

  play() {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.startSequenceLoop();
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
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

