export class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initialized = false;

    this.engineOsc = null;
    this.engineGain = null;
    this.driftNoiseNode = null;
    this.driftGain = null;
  }

  init() {
    if (this.initialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this._setupContinuousNodes();
      this.initialized = true;
    } catch {
      this.initialized = false;
    }
  }

  _setupContinuousNodes() {
    if (!this.ctx) return;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 260;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0.0;

    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.value = 55;

    this.engineOsc.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);
    this.engineOsc.start();

    const bufferSize = this.ctx.sampleRate * 0.5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1350;
    bandpass.Q.value = 2.8;

    this.driftGain = this.ctx.createGain();
    this.driftGain.gain.value = 0.0;

    this.driftNoiseNode = this.ctx.createBufferSource();
    this.driftNoiseNode.buffer = noiseBuffer;
    this.driftNoiseNode.loop = true;

    this.driftNoiseNode.connect(bandpass);
    bandpass.connect(this.driftGain);
    this.driftGain.connect(this.ctx.destination);
    this.driftNoiseNode.start();
  }

  toggleMute() {
    this.init();
    this.enabled = !this.enabled;
    if (!this.enabled && this.ctx) {
      this.stopContinuous();
    }
    return this.enabled;
  }

  updateContinuous(speedRatio, isDrifting, isPlaying) {
    if (!this.initialized || !this.ctx || !this.enabled || !isPlaying) {
      this.stopContinuous();
      return;
    }

    const now = this.ctx.currentTime;
    const targetFreq = 52 + speedRatio * 115 + (isDrifting ? 18 : 0);
    this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.05);
    this.engineGain.gain.setTargetAtTime(0.045, now, 0.08);

    const targetDriftGain = isDrifting ? 0.038 : 0.0;
    this.driftGain.gain.setTargetAtTime(targetDriftGain, now, 0.06);
  }

  stopContinuous() {
    if (!this.initialized || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.engineGain) {
      this.engineGain.gain.setTargetAtTime(0.0, now, 0.04);
    }
    if (this.driftGain) {
      this.driftGain.gain.setTargetAtTime(0.0, now, 0.04);
    }
  }

  playCoin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.055);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  playCheckpoint() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    const now = this.ctx.currentTime;

    for (let i = 0; i < notes.length; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + i * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[i], start);

      gain.gain.setValueAtTime(0.09, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.26);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.27);
    }
  }

  playCrash() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    this.stopContinuous();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(135, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.38);

    oscGain.gain.setValueAtTime(0.22, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.42);
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  playBeep(isGo = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isGo ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isGo ? 880 : 440, now);

    gain.gain.setValueAtTime(isGo ? 0.22 : 0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isGo ? 0.35 : 0.18));

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + (isGo ? 0.36 : 0.2));
  }
}
