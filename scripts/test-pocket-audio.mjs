import assert from 'node:assert/strict';
import { PocketAudio } from '../src/lib/pocketAudio.js';

const sources = [];
class FakeContext {
  currentTime = 10;
  destination = {};
  async resume() {}
  async close() {}
  async decodeAudioData() { return { duration: 12 }; }
  createBufferSource() {
    const source = { connect() {}, disconnect() {}, start(...args) { this.args = args; }, stop() { this.stopped = true; } };
    sources.push(source); return source;
  }
  createGain() { return { connect() {}, disconnect() {}, gain: { value: 0, cancelAndHoldAtTime() {}, linearRampToValueAtTime(value) { this.target = value; } } }; }
}
globalThis.window = { AudioContext: FakeContext };
globalThis.fetch = async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) });
const demo = { id: 'first', duration: 12, files: { bypass: '/a', pocket: '/b' } };
const audio = new PocketAudio(() => {});
try {
  await audio.play(demo, 'bypass');
  assert.equal(audio.state.status, 'playing');
  assert.deepEqual(sources[0].args, sources[1].args, 'Both versions start at the same time and offset');
  assert.equal(audio.nodes[0].gain.gain.value, 1);
  assert.equal(audio.nodes[1].gain.gain.value, 0);
  audio.context.currentTime = 13.025;
  audio.setMode('pocket');
  assert.equal(sources.length, 2, 'Switching must not restart sources');
  assert.equal(audio.nodes[0].gain.gain.target, 0);
  assert.equal(audio.nodes[1].gain.gain.target, 1);
  audio.pause();
  assert.equal(audio.state.position, 3);
  assert.ok(sources.every(source => source.stopped));
  await audio.play(demo, 'pocket');
  assert.equal(audio.nodes[0].source.args[1], 3, 'Resume preserves position');
  audio.seek(7);
  assert.deepEqual(audio.nodes.map(node => node.source.args[1]), [7, 7]);
  const previous = [...audio.nodes];
  await audio.play({ ...demo, id: 'second' }, 'bypass');
  assert.ok(previous.every(node => node.source.stopped), 'Only one demo plays');
  audio.nodes[0].source.onended();
  assert.equal(audio.state.status, 'paused');
  assert.equal(audio.state.position, 12);
  await audio.play({ ...demo, id: 'second' }, 'bypass');
  assert.equal(audio.nodes[0].source.args[1], 0, 'Replay starts at zero');
  globalThis.fetch = async () => ({ ok: false });
  await audio.play({ ...demo, id: 'failed' }, 'bypass');
  assert.equal(audio.state.status, 'error');
  globalThis.fetch = (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted'))));
  const pending = audio.play({ ...demo, id: 'cancelled' }, 'bypass');
  await new Promise(resolve => setTimeout(resolve, 0));
  audio.pause();
  await pending;
  assert.equal(audio.state.status, 'paused', 'Cancelled loads must not start playback');
  console.log('PASS: synchronized start, live A/B switch, pause/resume, seeking, one-at-a-time playback, replay, network failure, and cancelled loading');
} finally { audio.dispose(); }
