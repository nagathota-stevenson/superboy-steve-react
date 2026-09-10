import './pocket.css';
import Nav from './components/Nav.jsx';
import Home from './Home.jsx';
import MusicPage from './MusicPage.jsx';
import PocketPage from './PocketPage.jsx';

export default function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const isMusicPage = pathname === '/music';
  const isPocketPage = pathname === '/pocket';

  if (isPocketPage) return <PocketPage />;

  return (
    <>
      <Nav isMusicPage={isMusicPage} />
      {isMusicPage ? <MusicPage /> : <Home />}
    </>
  );
}
