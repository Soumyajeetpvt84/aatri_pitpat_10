import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { memorablePlaces, MemorablePlace } from '../data/memorablePlaces';
import GlassCard from '../components/GlassCard';
import { X, ExternalLink, Trash2 } from 'lucide-react';

type View = 'places' | 'bucketList';

const MapPage: React.FC = () => {
    const [selectedPlace, setSelectedPlace] = useState<MemorablePlace | null>(null);
    const [isModalClosing, setIsModalClosing] = useState(false);

    const [activeView, setActiveView] = useState<View>('places');
    const [bucketList, setBucketList] = useState<string[]>([]);
    const [newBucketItem, setNewBucketItem] = useState('');
    const [viewAnimation, setViewAnimation] = useState('');
    const [contentAnimation, setContentAnimation] = useState('');
    
    const modalContainer = document.getElementById('modal-root');

    useEffect(() => {
        // Initial fade-in for the whole component
        setContentAnimation('animate-content-fade-in');

        // Load bucket list from local storage
        const storedBucketList = localStorage.getItem('pitpatBucketList');
        if (storedBucketList) {
            try {
                setBucketList(JSON.parse(storedBucketList));
            } catch (e) {
                console.error("Failed to parse bucket list from localStorage", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('pitpatBucketList', JSON.stringify(bucketList));
    }, [bucketList]);

    const handleAddBucketItem = () => {
        if (newBucketItem.trim()) {
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]); // Success haptic
            setBucketList(prev => [...prev, newBucketItem.trim()]);
            setNewBucketItem('');
        }
    };
    
    const handleDeleteBucketItem = (indexToDelete: number) => {
        if (navigator.vibrate) navigator.vibrate(100); // Action haptic
        setBucketList(prev => prev.filter((_, index) => index !== indexToDelete));
    };

    const handleCloseModal = () => {
        if (navigator.vibrate) navigator.vibrate(10);
        setIsModalClosing(true);
        setTimeout(() => {
            setSelectedPlace(null);
            setIsModalClosing(false); // Reset for next time
        }, 300); // Must match animation duration
    };

    const switchView = (view: View) => {
        if (view === activeView) return;
        if (navigator.vibrate) navigator.vibrate(10); // Haptic for tab switch

        // Set exit animation
        if (activeView === 'places' && view === 'bucketList') {
            setViewAnimation('animate-slide-out-to-left');
        } else {
            setViewAnimation('animate-slide-out-to-right');
        }

        // After exit animation, switch content and set enter animation
        setTimeout(() => {
            setActiveView(view);
            if (view === 'bucketList') {
                setViewAnimation('animate-slide-in-from-right');
            } else {
                setViewAnimation('animate-slide-in-from-left');
            }
        }, 400); // Should be animation duration
    };
    
    return (
        <div className={`container mx-auto pb-8 ${contentAnimation}`}>
            <h1 className="text-3xl font-bold text-pink-600 mb-2">Our Compass</h1>
            <p className="text-slate-600 font-nunito mb-6">Navigating the map of our shared journey.</p>

            <div className="flex justify-center mb-6 bg-white/20 p-1 rounded-full backdrop-blur-sm w-fit mx-auto">
                <button 
                    onClick={() => switchView('places')} 
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeView === 'places' ? 'bg-white shadow text-pink-600' : 'text-slate-600'}`}
                >
                    Our Special Places
                </button>
                <button 
                    onClick={() => switchView('bucketList')} 
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeView === 'bucketList' ? 'bg-white shadow text-pink-600' : 'text-slate-600'}`}
                >
                    Adventure Bucket List
                </button>
            </div>
            
            <div className="relative">
                <div className={viewAnimation}>
                    {activeView === 'places' ? (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {memorablePlaces.map((place: MemorablePlace) => (
                                    <div
                                        key={place.title}
                                        className="relative h-64 rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
                                        onClick={() => {
                                          if (navigator.vibrate) navigator.vibrate(10);
                                          setSelectedPlace(place);
                                        }}
                                    >
                                        <img src={place.imageUrl} alt={place.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                        <div className="relative w-full h-full p-4 flex flex-col justify-end text-white">
                                            <h3 className="text-xl font-bold drop-shadow-lg">{place.emoji} {place.title}</h3>
                                            <p className="text-sm italic drop-shadow-lg">"{place.description}"</p>
                                            <p className="text-xs text-pink-300 mt-1 drop-shadow-lg">{place.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex gap-2 mb-4">
                                <input 
                                    type="text" 
                                    value={newBucketItem}
                                    onChange={(e) => setNewBucketItem(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddBucketItem()}
                                    placeholder="e.g., See the Northern Lights"
                                    className="flex-grow p-3 bg-white/50 border border-white/60 rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none backdrop-blur-sm placeholder-slate-500"
                                />
                                <button onClick={() => {
                                  if (navigator.vibrate) navigator.vibrate(10);
                                  handleAddBucketItem();
                                }} className="px-5 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors">
                                    Add
                                </button>
                            </div>
                            {bucketList.length === 0 ? (
                                <p className="text-center text-slate-500 font-nunito mt-8">Let's dream of our next adventure!</p>
                            ) : (
                                <ul className="space-y-3">
                                    {bucketList.map((item, index) => (
                                        <GlassCard key={index} className="p-3 flex justify-between items-center animate-content-fade-in" style={{animationDelay: `${index * 50}ms`}}>
                                            <span className="text-slate-800">{item}</span>
                                            <button onClick={() => {
                                              if (navigator.vibrate) navigator.vibrate(10);
                                              handleDeleteBucketItem(index);
                                            }} className="p-1 text-red-400 hover:text-red-600 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </GlassCard>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {selectedPlace && modalContainer && createPortal(
                <div 
                    className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 ${isModalClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
                    onClick={handleCloseModal}
                >
                    <GlassCard 
                        className={`w-full max-w-lg max-h-[90vh] flex flex-col ${isModalClosing ? 'animate-fade-out' : 'animate-pookie-in'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative">
                            <img src={selectedPlace.imageUrl} alt={selectedPlace.title} className="w-full max-h-[60vh] object-contain rounded-t-2xl bg-black/20" />
                            <button 
                                onClick={handleCloseModal} 
                                className="absolute top-3 right-3 p-2 bg-white/50 rounded-full text-slate-800 hover:bg-white/80 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 flex-grow flex flex-col text-center bg-white/20">
                            <h2 className="text-2xl font-bold text-fuchsia-800">{selectedPlace.emoji} {selectedPlace.title}</h2>
                            <p className="text-slate-700 italic my-2">"{selectedPlace.description}"</p>
                            <p className="text-sm text-pink-500 mb-6">{selectedPlace.date}</p>
                            <a 
                                href={selectedPlace.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="mt-auto flex items-center justify-center gap-2 w-full px-4 py-3 bg-pink-500 rounded-lg text-white font-semibold shadow-lg hover:bg-pink-600 transition-all duration-300 transform hover:scale-105"
                            >
                                View on Map <ExternalLink size={18} />
                            </a>
                        </div>
                    </GlassCard>
                </div>,
                modalContainer
            )}
        </div>
    );
};

export default MapPage;