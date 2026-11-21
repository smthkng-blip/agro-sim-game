import type { AnimalType } from '../sim/types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        this.ctx = new AudioCtx();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private tone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainPeak = 0.08,
    delay = 0,
  ): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + Math.min(0.02, duration * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick(): void {
    this.tone(520, 680, 0.045, 'triangle', 0.045);
  }

  public playPlantPop(): void {
    this.tone(180, 320, 0.08, 'sine', 0.08);
    this.tone(360, 480, 0.07, 'triangle', 0.05, 0.05);
  }

  public playWaterSplash(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    // Soft filtered noise burst + droplet plink
    const bufferSize = Math.floor(ctx.sampleRate * 0.14);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.14);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();

    this.tone(660, 980, 0.07, 'sine', 0.04, 0.04);
  }

  public playHarvestChime(): void {
    this.tone(523.25, 523.25, 0.11, 'triangle', 0.075, 0);
    this.tone(659.25, 659.25, 0.12, 'triangle', 0.075, 0.07);
    this.tone(783.99, 783.99, 0.16, 'sine', 0.08, 0.14);
  }

  public playCoinClink(): void {
    this.tone(1174, 1568, 0.09, 'sine', 0.065, 0);
    this.tone(1568, 2093, 0.13, 'sine', 0.055, 0.06);
  }

  public playHeartChime(): void {
    this.tone(587.3, 783.99, 0.12, 'sine', 0.065, 0);
    this.tone(880, 1046.5, 0.15, 'sine', 0.06, 0.08);
  }

  public playAnimalSound(type: AnimalType): void {
    if (type === 'chicken') {
      this.tone(740, 960, 0.06, 'triangle', 0.06, 0);
      this.tone(820, 620, 0.07, 'triangle', 0.055, 0.07);
    } else if (type === 'cow') {
      this.tone(155, 130, 0.28, 'sawtooth', 0.045, 0);
      this.tone(130, 118, 0.18, 'triangle', 0.04, 0.15);
    } else {
      this.tone(240, 340, 0.08, 'sawtooth', 0.045, 0);
      this.tone(280, 200, 0.09, 'triangle', 0.045, 0.08);
    }
  }

  public playNextDayChime(): void {
    this.tone(392, 392, 0.12, 'sine', 0.055, 0);
    this.tone(493.88, 493.88, 0.12, 'sine', 0.055, 0.09);
    this.tone(587.33, 587.33, 0.18, 'sine', 0.06, 0.18);
  }
}

export const sfx = new SoundEngine();
