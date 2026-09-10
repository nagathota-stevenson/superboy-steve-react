import { useEffect, useRef, useState } from 'react';
import { PocketAudio } from '../lib/pocketAudio.js';
import demos from './pocketDemos.json';

const time = value => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
function PlaybackIcon({ status }) {
  if (status === 'loading') return <span className="pk-audio-loader" />;
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{status === 'playing' ? <path d="M7 5h4v14H7zm6 0h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}</svg>;
}

export default function PocketDemos() {
  const engine = useRef(null);
  const [playback, setPlayback] = useState({ id: null, status: 'idle', position: 0 });
  const [modes, setModes] = useState({});
  useEffect(() => {
    const audio = new PocketAudio(setPlayback);
    engine.current = audio;
    return () => { audio.dispose(); engine.current = null; };
  }, []);
  return <section className="pk-workflow pk-section pk-listening" id="workflow">
    <div className="pk-section-head" data-reveal>
      <div><div className="pk-eyebrow">02 / Hear the difference</div><h2>Same mix.<br /><em>A little more space.</em></h2></div>
      <p>Press play. Switch between Bypass and Pocket to hear the difference at the same moment in the mix.</p>
    </div>
    <div className="pk-listening-meta"><span><span aria-hidden="true">◉</span> THE LISTENING ROOM</span><span>03 comparisons · Original WAV audio</span></div>
    <div className="pk-demo-grid">{demos.map((demo, index) => {
      const active = playback.id === demo.id;
      const status = active ? playback.status : 'idle';
      const mode = modes[demo.id] || 'bypass';
      const duration = active ? playback.duration : demo.duration;
      const position = active ? playback.position : 0;
      const progress = position / duration;
      return <article className="pk-demo" key={demo.id} data-mode={mode} data-playing={status === 'playing'}>
        <div className="pk-demo-heading"><span>0{index + 1} /</span><span className="pk-demo-state">{status === 'loading' ? 'Loading audio' : status === 'playing' ? 'Now playing' : status === 'error' ? 'Try again' : 'Ready to listen'}</span></div>
        <h3>{demo.title}</h3><p>{demo.description}</p>
        <div className="pk-audio-wave" aria-hidden="true">{demo.peaks[mode].map((height,i) => <i key={i} className={progress > i / 72 ? 'is-played' : ''} style={{ height: `${Math.max(4, height * 100)}%` }} />)}</div>
        <div className="pk-audio-transport">
          <button className="pk-audio-play" type="button" aria-label={`${status === 'playing' ? 'Pause' : status === 'loading' ? 'Cancel loading' : 'Play'} ${demo.title}`} onClick={() => status === 'loading' ? engine.current?.pause() : engine.current?.play(demo, mode)}><PlaybackIcon status={status} /></button>
          <div className="pk-audio-timeline"><label className="pk-visually-hidden" htmlFor={`seek-${demo.id}`}>Seek {demo.title}</label><input id={`seek-${demo.id}`} type="range" min="0" max={duration} step="0.01" value={position} disabled={!active || status === 'loading' || status === 'error'} onChange={event => engine.current?.seek(Number(event.target.value))} aria-valuetext={`${time(position)} of ${time(duration)}`} style={{ '--audio-progress': `${progress * 100}%` }} /><div><span>{time(position)}</span><span>{time(duration)}</span></div></div>
        </div>
        <div className="pk-audio-switch" role="group" aria-label={`${demo.title} comparison`} data-mode={mode}>{['bypass', 'pocket'].map(version => <button type="button" key={version} aria-pressed={mode === version} onClick={() => { setModes(previous => ({ ...previous, [demo.id]: version })); if (active) engine.current?.setMode(version); }}>{version === 'bypass' ? 'Bypass' : 'With Pocket'}{version === 'pocket' && <span aria-hidden="true">✦</span>}</button>)}</div>
        <p className="pk-audio-feedback" role="status">{status === 'error' ? 'Audio couldn’t load. Press play to try again.' : status === 'loading' ? 'Preparing both versions…' : mode === 'pocket' ? 'Pocket processing on' : 'Pocket processing bypassed'}</p>
      </article>;
    })}</div>
    <div className="pk-listening-note"><span>Switch freely. Playback stays in sync.</span><span>For the details, listen on headphones.</span></div>
  </section>;
}
