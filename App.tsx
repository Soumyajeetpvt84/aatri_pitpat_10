import React, { useState, useEffect, useMemo } from 'react';
import BottomNavBar from './components/BottomNavBar';
import HomePage from './pages/HomePage';
import MemoriesPage from './pages/MemoriesPage';
import MapPage from './pages/MapPage';
import ArchivePage from './pages/ArchivePage';
import { Page } from './types';
import { Heart, Image, Map, HeartPulse } from 'lucide-react';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('home');
  const [showGreeting, setShowGreeting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const backgroundClass = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) { // Morning
      return 'from-rose-100 via-fuchsia-100 to-indigo-100';
    } else if (hour >= 12 && hour < 18) { // Afternoon/Sunset
      return 'from-amber-100 via-orange-200 to-rose-200';
    } else { // Night
      return 'from-indigo-200 via-purple-200 to-pink-200';
    }
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'memories':
        return <MemoriesPage />;
      case 'map':
        return <MapPage />;
      case 'archive':
        return <ArchivePage />;
      default:
        return <HomePage />;
    }
  };

  const navItems = [
    { id: 'home' as Page, icon: Heart, label: 'Home' },
    { id: 'memories' as Page, icon: Image, label: 'Memories' },
    { id: 'map' as Page, icon: Map, label: 'Compass' },
    { id: 'archive' as Page, icon: HeartPulse, label: 'Impulse Heart' },
  ];

  return (
    <div className={`fixed inset-0 h-full w-full bg-gradient-to-br transition-all duration-1000 ease-in-out ${backgroundClass}`}>
      <div className="absolute inset-0 overflow-y-auto pb-24 text-slate-800">
        {showGreeting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70 backdrop-blur-sm">
            <p className="text-2xl font-nunito text-center p-8 animate-pulse text-pink-500">
              “PitPat has been waiting for your heartbeat… shall we make today another memory?” 💗
            </p>
          </div>
        )}
        <main className="p-4 pt-8 h-full">
            {renderPage()}
        </main>
      </div>
      <BottomNavBar items={navItems} activePage={activePage} onNavigate={setActivePage} />
    </div>
  );
};

export default App;
