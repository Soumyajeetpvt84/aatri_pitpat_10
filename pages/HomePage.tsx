import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { getRandomAffectionateLine } from '../services/geminiService';
import { useGestures } from '../hooks/useGestures';
import { useTilt } from '../hooks/useTilt';
import GlassCard from '../components/GlassCard';
import { userImages } from '../data/userImages';
import { compliments } from '../data/compliments';

const HomePage: React.FC = () => {
  const [specialMessage, setSpecialMessage] = useState('');
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const tilt = useTilt(true);

  const [complimentForToday, setComplimentForToday] = useState('');
  const [showComplimentPopup, setShowComplimentPopup] = useState(false);

  // Effect for background carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex(prevIndex => (prevIndex + 1) % userImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  // Effect for Daily Compliment
  useEffect(() => {
    const today = new Date().toDateString();
    let data = { date: '', compliment: '', usedIndices: [] };

    try {
        const storedComplimentData = localStorage.getItem('pitpatCompliments');
        if (storedComplimentData) {
            data = JSON.parse(storedComplimentData);
        }
    } catch(error) {
        console.error("Failed to parse pitpatCompliments from localStorage", error);
        localStorage.removeItem('pitpatCompliments');
    }


    if (data.date === today && data.compliment) {
      setComplimentForToday(data.compliment);
    } else {
      let usedIndices: number[] = data.usedIndices || [];
      if (usedIndices.length >= compliments.length) {
        usedIndices = []; // Reset if all compliments have been used
      }

      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * compliments.length);
      } while (usedIndices.includes(randomIndex));

      const newCompliment = compliments[randomIndex];
      usedIndices.push(randomIndex);

      const newData = {
        date: today,
        compliment: newCompliment,
        usedIndices: usedIndices,
      };
      
      localStorage.setItem('pitpatCompliments', JSON.stringify(newData));
      setComplimentForToday(newCompliment);
    }
  }, []);

  const showTempMessage = (msg: string) => {
      setSpecialMessage(msg);
      setTimeout(() => setSpecialMessage(''), 4000);
  }

  const handleShake = useCallback(async () => {
    if (navigator.vibrate) navigator.vibrate(100); // Haptic for gesture
    const randomLine = await getRandomAffectionateLine();
    showTempMessage(randomLine);
  }, []);
  
  const handleTapThrice = useCallback(() => {
      if (navigator.vibrate) navigator.vibrate([20, 40, 20]); // Haptic for gesture
      showTempMessage("I love you infinity ♾️");
  }, []);

  const handleLongPress = useCallback(() => {
      setIsLongPressing(true);
      if (navigator.vibrate) navigator.vibrate(200);
      setTimeout(() => setIsLongPressing(false), 1500);
  }, []);

  const gestureHandlers = useGestures({
      onShake: handleShake,
      onTapThrice: handleTapThrice,
      onLongPress: handleLongPress
  });
  
  const tiltStyle = {
    transform: `perspective(1000px) rotateX(${-tilt.y / 20}deg) rotateY(${tilt.x / 20}deg) scale3d(1.05, 1.05, 1.05)`,
    transition: 'transform 0.1s linear'
  };

  return (
    <div className="relative h-full w-full" {...gestureHandlers}>
      {/* Background Carousel */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 opacity-50 blur-sm">
        {userImages.map((src, index) => (
            <img key={index} src={src} alt="A loving memory background"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`} />
        ))}
      </div>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden z-10 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="particle text-pink-300" 
            style={{ left: `${Math.random() * 100}%`, animationDuration: `${Math.random() * 20 + 20}s`, animationDelay: `${Math.random() * 10}s` }}>♥</div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center p-4">
        <div style={tiltStyle}>
            <div className={`relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center transition-all duration-500 ${isLongPressing ? 'scale-110' : ''}`}>
                <img
                    src="https://i.postimg.cc/bNH2wPtK/home-logo.png"
                    alt="PitPat Heart"
                    className={`w-full h-full object-contain animate-subtle-float-pulse transition-all duration-300 ${isLongPressing ? 'drop-shadow-[0_0_25px_rgba(236,72,153,1)]' : 'drop-shadow-[0_0_15px_rgba(236,72,153,0.7)]'}`}
                />
            </div>
        </div>
        
        <p className="mt-8 text-lg text-fuchsia-800/90 font-nunito animate-pulse">Shake for a message 💌</p>

        <button 
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
            setShowComplimentPopup(true);
          }}
          className="mt-6 px-6 py-3 bg-white/50 backdrop-blur-lg border border-white/60 rounded-full shadow-lg text-pink-600 font-semibold font-nunito transition-all duration-300 hover:scale-105 hover:shadow-pink-500/30 active:scale-95"
        >
          Just for you 💌
        </button>
      </div>

      {/* Special Message Toast */}
      {specialMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 w-full px-4 flex justify-center pointer-events-none">
            <GlassCard className="p-4 w-full max-w-md animate-pookie-in shadow-2xl shadow-pink-500/30">
                <p className="text-center font-nunito text-fuchsia-800 italic">"{specialMessage}"</p>
            </GlassCard>
        </div>
      )}

      {/* Compliment Popup */}
      {showComplimentPopup && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowComplimentPopup(false)}>
          <GlassCard className="w-full max-w-md p-8 relative animate-pookie-in" onClick={(e) => e.stopPropagation()}>
             <button onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
                setShowComplimentPopup(false);
              }} className="absolute top-2 right-2 p-2 text-slate-500 hover:text-slate-800">
                <X size={24} />
             </button>
             <p className="text-2xl text-center font-nunito text-fuchsia-800">{complimentForToday}</p>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default HomePage;
