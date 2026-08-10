import { useEffect, useState } from 'react';
import Reveal from './Reveal.jsx';
import { FaSpotify, FaYoutube } from 'react-icons/fa';
import { SiApplemusic } from 'react-icons/si';

const SONGS = [
  {
    title: 'Neethone',
    image: '/artworks/neethone.jpg',
    links: {
      spotify: 'https://open.spotify.com/track/0F95hDH2IfDVW6c01mJUSS',
      apple: 'https://music.apple.com/us/album/neethone-single/1883262030',
      youtube: 'https://youtu.be/gxkWAsCzkAM',
    },
  },
  {
    title: 'Rakshakudu Puttade',
    image: '/artworks/rakshakudu.jpg',
    links: {
      spotify: 'https://open.spotify.com/track/3eonBgSjtOVl3u9mB3yA6H',
      apple: 'https://music.apple.com/us/album/rakshakudu-puttade-feat-jacin-john-wesley-single/1786527553',
      youtube: 'https://youtu.be/KMHLZNnq1Eo',
    },
  },
  {
    title: 'Song of the Prodigal',
    image: '/artworks/sotp.jpg',
    links: {
      spotify: 'https://open.spotify.com/track/2jJUx41fMd0dTYgwuvLiRJ',
      apple: 'https://music.apple.com/us/album/song-of-the-prodigal-single/1792016634',
      youtube: 'https://youtu.be/OFjemagBmWc',
    },
  },
  {
    title: 'Thirigilechenuga',
    image: '/artworks/thirigi.jpg',
    links: {
      spotify: 'https://open.spotify.com/track/4HKwuMks7mB83qtnSuPkuu',
      apple: 'https://music.apple.com/us/album/thirigilechenuga-single/1808672218',
      youtube: 'https://youtu.be/DrrQZkFrMVA',
    },
  },
  {
    title: 'Velige Thaara',
    image: '/artworks/velige.jpg',
    links: {
      spotify: 'https://open.spotify.com/track/4WdRJnjnqVanPSiZGiUWTG',
      apple: 'https://music.apple.com/us/album/velige-thaara-single/1863328981',
      youtube: 'https://youtu.be/QDKQzkw3HiQ',
    },
  },
];

export default function Music() {
  const [currentArtwork, setCurrentArtwork] = useState(null);
  const [previousArtwork, setPreviousArtwork] = useState(null);
  const [currentVisible, setCurrentVisible] = useState(false);
  const [previousVisible, setPreviousVisible] = useState(false);

  useEffect(() => {
    if (!currentArtwork) {
      setCurrentVisible(false);
      return;
    }

    const frame = window.requestAnimationFrame(() => setCurrentVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [currentArtwork]);

  useEffect(() => {
    if (!previousArtwork) {
      setPreviousVisible(false);
      return;
    }

    setPreviousVisible(true);
    const timeout = window.setTimeout(() => {
      setPreviousVisible(false);
      setPreviousArtwork(null);
    }, 560);

    return () => {
      window.clearTimeout(timeout);
      setPreviousVisible(false);
    };
  }, [previousArtwork]);

  function handleHover(image) {
    if (image === currentArtwork) return;
    if (currentArtwork) {
      setPreviousArtwork(currentArtwork);
    }
    setCurrentArtwork(image);
  }

  function handleLeave() {
    if (!currentArtwork) return;
    setPreviousArtwork(currentArtwork);
    setCurrentArtwork(null);
  }

  return (
    <section id="music" className="music-section">
      <div
        className={`music-hover-bg music-hover-bg--prev ${previousVisible ? 'visible' : ''}`}
        style={{ backgroundImage: previousArtwork ? `url(${previousArtwork})` : 'none' }}
        aria-hidden="true"
      />
      <div
        className={`music-hover-bg music-hover-bg--current ${currentVisible ? 'visible' : ''}`}
        style={{ backgroundImage: currentArtwork ? `url(${currentArtwork})` : 'none' }}
        aria-hidden="true"
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <Reveal className="section-head">
          <div>
            <div className="eyebrow">Music</div>
            <h2 className="section-title">Listen to my latest songs.</h2>
          </div>
        </Reveal>

        <div className="music-grid">
          {SONGS.map((song) => (
            <Reveal
              key={song.title}
              className="music-card"
              onMouseEnter={() => handleHover(song.image)}
              onMouseLeave={handleLeave}
            >
              <div className="music-cover">
                <img src={song.image} alt={`${song.title} artwork`} />
              </div>
              <div className="music-card-body">
                <h3>{song.title}</h3>
                <div className="platform-links">
                  <a
                    href={song.links.spotify}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-icon"
                    aria-label={`Listen to ${song.title} on Spotify`}
                  >
                    <FaSpotify />
                  </a>
                  <a
                    href={song.links.apple}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-icon"
                    aria-label={`Listen to ${song.title} on Apple Music`}
                  >
                    <SiApplemusic />
                  </a>
                  <a
                    href={song.links.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-icon"
                    aria-label={`Watch ${song.title} on YouTube`}
                  >
                    <FaYoutube />
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
