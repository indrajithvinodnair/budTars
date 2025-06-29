import ReactDOM from 'react-dom/client';
import { HashRouter ,Routes, Route } from 'react-router-dom';
import { App } from './App';
import { Settings } from './pages/settings';
import { RawData } from './pages/raw-data';
import { DarkModeProvider } from './contexts/DarkmodeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <DarkModeProvider>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/raw-data" element={<RawData />} />
      </Routes>
    </HashRouter>
  </DarkModeProvider>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')  // Updated path
      .then(registration => {
        console.log('SW registered:', registration);
        
        // Check for updates every hour
        setInterval(() => registration.update(), 60 * 60 * 1000);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}