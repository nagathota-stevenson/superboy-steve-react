// Both versions use one AudioContext clock. Switching only changes their gains.
export class PocketAudio {
  constructor(onChange) {
    this.onChange = onChange;
    this.cache = new Map();
    this.state = { id: null, status: 'idle', position: 0, duration: 0, mode: 'bypass' };
    this.nodes = [];
    this.generation = 0;
  }
  emit(patch) { this.state = { ...this.state, ...patch }; this.onChange(this.state); }
  position() {
    return this.state.status === 'playing'
      ? Math.min(this.state.duration, this.offset + Math.max(0, this.context.currentTime - this.startedAt))
      : this.state.position;
  }
  stopNodes() {
    clearInterval(this.timer);
    this.nodes.forEach(({ source, gain }) => { source.onended = null; try { source.stop(); } catch {} source.disconnect(); gain.disconnect(); });
    this.nodes = [];
  }
  pause() {
    const position = this.position();
    this.generation++;
    this.controller?.abort();
    this.stopNodes();
    this.emit({ status: 'paused', position });
  }
  async play(demo, mode) {
    if (this.state.id === demo.id && this.state.status === 'playing') { this.pause(); return; }
    const position = this.state.id === demo.id && this.state.position < demo.duration ? this.state.position : 0;
    this.pause();
    const generation = this.generation;
    this.emit({ id: demo.id, status: 'loading', position, duration: demo.duration, mode });
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.context ||= new AudioContext();
      await this.context.resume();
      if (generation !== this.generation) return;
      let buffers = this.cache.get(demo.id);
      if (!buffers) {
        this.controller = new AbortController();
        const controller = this.controller;
        const signal = controller.signal;
        const timeout = setTimeout(() => controller.abort(), 30000);
        try {
          buffers = await Promise.all(['bypass', 'pocket'].map(async version => {
            const response = await fetch(demo.files[version], { signal });
            if (!response.ok) throw new Error('Audio unavailable');
            return this.context.decodeAudioData(await response.arrayBuffer());
          }));
        } finally { clearTimeout(timeout); }
        if (generation !== this.generation) return;
        this.cache.set(demo.id, buffers);
      }
      this.buffers = buffers;
      this.emit({ duration: Math.min(...buffers.map(buffer => buffer.duration)) });
      this.start(position);
    } catch {
      if (generation === this.generation) this.emit({ status: 'error' });
    }
  }
  start(position) {
    this.stopNodes();
    this.offset = Math.max(0, Math.min(position, this.state.duration));
    this.startedAt = this.context.currentTime + .025;
    this.nodes = this.buffers.map((buffer, i) => {
      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      source.buffer = buffer;
      gain.gain.value = (this.state.mode === 'bypass' ? 0 : 1) === i ? 1 : 0;
      source.connect(gain); gain.connect(this.context.destination);
      source.start(this.startedAt, this.offset);
      return { source, gain };
    });
    this.emit({ status: 'playing', position: this.offset });
    this.nodes[0].source.onended = () => { this.stopNodes(); this.emit({ status: 'paused', position: this.state.duration }); };
    this.timer = setInterval(() => this.emit({ position: this.position() }), 80);
  }
  setMode(mode) {
    if (mode === this.state.mode) return;
    this.emit({ mode });
    this.nodes.forEach(({ gain }, i) => {
      const now = this.context.currentTime;
      // A short linear crossfade avoids switching clicks without a gain boost.
      gain.gain.cancelAndHoldAtTime(now);
      gain.gain.linearRampToValueAtTime((mode === 'bypass' ? 0 : 1) === i ? 1 : 0, now + .025);
    });
  }
  seek(position) {
    const next = Math.max(0, Math.min(position, this.state.duration));
    if (this.state.status === 'playing' && next < this.state.duration) this.start(next);
    else { this.pause(); this.emit({ position: next }); }
  }
  dispose() {
    this.generation++; this.controller?.abort(); this.stopNodes();
    this.context?.close().catch(() => {}); this.cache.clear();
  }
}
