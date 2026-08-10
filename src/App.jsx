import Nav from './components/Nav.jsx';
import Home from './Home.jsx';
import MusicPage from './MusicPage.jsx';

export default function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const isMusicPage = pathname === '/music';

  return (
    <>
      <Nav isMusicPage={isMusicPage} />
      {isMusicPage ? <MusicPage /> : <Home />}
    </>
  );
}
