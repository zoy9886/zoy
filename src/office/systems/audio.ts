export class OfficeAudio {
  enabled = false;
  private context?: AudioContext;
  private master?: GainNode;
  private lastStep = 0;
  async toggle() {
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.context.destination);
      const hum = this.context.createOscillator(),
        gain = this.context.createGain();
      hum.type = "sine";
      hum.frequency.value = 72;
      gain.gain.value = 0.013;
      hum.connect(gain).connect(this.master);
      hum.start();
      const room = this.context.createOscillator(),
        rg = this.context.createGain();
      room.frequency.value = 144;
      rg.gain.value = 0.004;
      room.connect(rg).connect(this.master);
      room.start();
    }
    await this.context.resume();
    this.enabled = !this.enabled;
    this.master!.gain.setTargetAtTime(
      this.enabled ? 1 : 0,
      this.context.currentTime,
      0.1,
    );
    return this.enabled;
  }
  step(time: number) {
    if (!this.enabled || !this.context || time - this.lastStep < 300) return;
    this.lastStep = time;
    this.tone(time % 2 ? 170 : 140, 0.017, 0.04);
  }
  chime() {
    if (!this.enabled) return;
    this.tone(660, 0.018, 0.14);
    setTimeout(() => this.tone(880, 0.013, 0.2), 100);
  }
  private tone(freq: number, volume: number, length: number) {
    if (!this.context || !this.master) return;
    const c = this.context,
      o = c.createOscillator(),
      g = c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(freq, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(
      freq * 0.7,
      c.currentTime + length,
    );
    g.gain.setValueAtTime(volume, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + length);
    o.connect(g).connect(this.master);
    o.start();
    o.stop(c.currentTime + length);
  }
}
