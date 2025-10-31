import React from 'react';
import type { LucideProps } from 'lucide-react';
import { Page } from '../types';

interface NavItem {
  id: Page;
  icon: React.ComponentType<LucideProps>;
  label: string;
}

interface BottomNavBarProps {
  items: NavItem[];
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ items, activePage, onNavigate }) => {
  const handleNavigate = (page: Page) => {
    if (navigator.vibrate) {
      navigator.vibrate(10); // Haptic feedback for a light tap
    }
    onNavigate(page);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-200 flex justify-around items-center z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
      {items.map((item) => {
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleNavigate(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
              isActive ? 'text-pink-500' : 'text-gray-500'
            }`}
          >
            <item.icon
              className={`h-7 w-7 transition-all duration-300 ${
                isActive ? 'transform scale-110 drop-shadow-[0_0_10px_rgba(236,72,153,0.7)]' : ''
              }`}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className="text-xs mt-1 font-semibold">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavBar;