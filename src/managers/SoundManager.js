// SoundManager — Web Audio API synthesiser.
// No external audio files required for V1. Swap with Howler.js + real files for V2.
export default class SoundManager {
  constructor() {
    this._ctx       = null;
    this._ambOscs   = [];
    this._paused    = false;
  }

  // Lazily init AudioContext (requires user gesture first)
  _getCtx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this._ctx.state === 'suspended') {
      this._ctx.resume().catch(() => {});
    }
    return this._ctx;
  }

  // Play a simple oscillator tone
  _tone(freq, type, dur, gain = 0.28, offset = 0) {
    try {
      const ctx = this._getCtx();
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = type;
      const t = ctx.currentTime + offset;
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.start(t); osc.stop(t + dur + 0.01);
    } catch (_) {}
  }

  // Synthesise noise burst
  _noise(dur, gain = 0.4, lpFreq = 600) {
    try {
      const ctx  = this._getCtx();
      const buf  = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      }
      const src    = ctx.createBufferSource();
      const filt   = ctx.createBiquadFilter();
      const g      = ctx.createGain();
      filt.type    = 'lowpass';
      filt.frequency.value = lpFreq;
      g.gain.value = gain;
      src.buffer = buf;
      src.connect(filt); filt.connect(g); g.connect(ctx.destination);
      src.start();
    } catch (_) {}
  }

  /* ── Sound effects ── */

  playJump() {
    this._tone(380, 'sine', 0.10, 0.18);
    this._tone(580, 'sine', 0.09, 0.14, 0.06);
    this._tone(760, 'sine', 0.07, 0.10, 0.10);
  }

  playCoin() {
    this._tone(880,  'sine', 0.07, 0.22);
    this._tone(1320, 'sine', 0.09, 0.18, 0.05);
  }

  playHit() {
    this._noise(0.22, 0.45, 380);
    this._tone(120, 'sawtooth', 0.18, 0.2, 0.02);
  }

  playShieldBreak() {
    this._tone(700, 'sawtooth', 0.28, 0.22);
    this._tone(350, 'sawtooth', 0.20, 0.18, 0.12);
    this._noise(0.15, 0.2, 800);
  }

  playPowerup() {
    [0, 0.06, 0.12, 0.18, 0.24].forEach((t, i) => {
      this._tone(440 + i * 120, 'sine', 0.14, 0.18, t);
    });
  }

  playGameOver() {
    [0, 0.14, 0.28, 0.44].forEach((t, i) => {
      this._tone(220 - i * 24, 'sawtooth', 0.5, 0.22, t);
    });
    this._noise(0.35, 0.3, 300);
  }

  /* ── Ambient music ── */

  startAmbient() {
    try {
      const ctx = this._getCtx();
      // Low detuned drone: A1 + slight beating
      [[55, 0], [55.6, 0.06], [82.5, 0.04]].forEach(([freq, gain]) => {
        const osc = ctx.createOscillator();
        const g   = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        g.gain.value = gain;
        osc.connect(g); g.connect(ctx.destination);
        osc.start();
        this._ambOscs.push(osc);
      });
    } catch (_) {}
  }

  stopAmbient() {
    this._ambOscs.forEach(o => { try { o.stop(); } catch (_) {} });
    this._ambOscs = [];
  }

  pause()  { try { this._getCtx().suspend(); } catch (_) {} }
  resume() { try { this._getCtx().resume();  } catch (_) {} }
}
