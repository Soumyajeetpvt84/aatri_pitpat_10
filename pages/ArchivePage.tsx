import React, { useState, useCallback, useRef } from 'react';
import { getMoodResponse } from '../services/geminiService';
import { MoodResponse } from '../types';
import GlassCard from '../components/GlassCard';
import { X, Play, Pause } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

type Mood = {
  id: 'happy' | 'angry' | 'sad' | 'tired' | 'romantic' | 'silly' | 'confused' | 'lonely';
  label: string;
  emoji: string;
  color: string;
  audioSrc: string;
};

const moods: Mood[] = [
    { id: 'happy', label: 'Happy', emoji: '🥰', color: 'from-yellow-200 to-pink-200', audioSrc: 'https://storage.googleapis.com/aai-web-samples/5-second-silence.mp3' },
    { id: 'angry', label: 'Angry', emoji: '😤', color: 'from-red-300 to-orange-200', audioSrc: 'https://storage.googleapis.com/aai-web-samples/5-second-silence.mp3' },
    { id: 'sad', label: 'Sad', emoji: '😔', color: 'from-blue-300 to-indigo-200', audioSrc: 'https://storage.googleapis.com/aai-web-samples/5-second-silence.mp3' },
    { id: 'tired', label: 'Tired', emoji: '😴', color: 'from-indigo-300 to-purple-300', audioSrc: 'https://storage.googleapis.com/aai-web-samples/5-second-silence.mp3' },
    { id: 'romantic', label: 'Romantic', emoji: '💞', color: 'from-rose-300 to-pink-300', audioSrc: 'https://storage.googleapis.com/aai-web-samples/5-second-silence.mp3' },
    { id: 'silly', label: 'Silly', emoji: '🤪', color: 'from-teal-200 to-cyan-300', audioSrc: 'https://storage.googleapis.com/aai-web-samples/5-second-silence.mp3' },
    { id: 'confused', label: 'Confused', emoji: '🤔', color: 'from-purple-200 to-violet-300', audioSrc: 'https://storage.googleapis.com/aai-web-samples/5-second-silence.mp3' },
    { id: 'lonely', label: 'Lonely', emoji: '💔', color: 'from-slate-300 to-gray-400', audioSrc: 'https://storage.googleapis.com/aai-web-samples/5-second-silence.mp3' },
];

const AudioPlayer: React.FC<{ src: string }> = ({ src }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(e => console.error("Audio play failed:", e));
        }
    };

    const handleTimeUpdate = () => setCurrentTime(audioRef.current?.currentTime || 0);
    const handleLoadedMetadata = () => setDuration(audioRef.current?.duration || 0);
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Number(e.target.value);
    };
    
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return isNaN(minutes) || isNaN(seconds) ? '0:00' : `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div className="w-full max-w-sm p-4 bg-white/30 rounded-xl backdrop-blur-md border border-white/40">
            <audio
                ref={audioRef}
                src={src}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
                preload="metadata"
            />
            <div className="flex items-center gap-4">
                <button onClick={togglePlayPause} className="text-pink-600 p-2 rounded-full bg-white/50 hover:bg-white/80 transition-colors">
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <div className="flex-grow flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-700 w-10">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-white/50 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                     <span className="text-xs font-mono text-slate-700 w-10 text-right">{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
};

const ImpulseHeartPage: React.FC = () => {
    const [activeMood, setActiveMood] = useState<Mood | null>(null);
    const [moodResponse, setMoodResponse] = useState<MoodResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    
    const fetchResponse = useCallback(async (moodId: Mood['id']) => {
        setIsLoading(true);
        setMoodResponse(null);
        if (navigator.vibrate) navigator.vibrate(20);

        try {
            const newResponse = await getMoodResponse(moodId);
            setMoodResponse(newResponse);
        } catch (error) {
            console.error("Error fetching mood response:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleMoodSelect = (mood: Mood) => {
        setActiveMood(mood);
        fetchResponse(mood.id);
    };
    
    const handleBack = () => {
        setIsLeaving(true);
        setTimeout(() => {
            setActiveMood(null);
            setMoodResponse(null);
            setIsLeaving(false);
        }, 300);
    };

    if (activeMood) {
        return (
            <div className={`fixed inset-0 z-50 w-full h-full bg-gradient-to-br ${activeMood.color} flex flex-col items-center justify-center p-4 text-center transition-opacity duration-300 ${isLeaving ? 'animate-fade-out' : 'animate-fade-in'}`}>
                <button onClick={handleBack} className="absolute top-6 right-6 p-2 bg-white/30 rounded-full text-slate-800 hover:bg-white/60 transition-colors z-10">
                    <X size={24} />
                </button>

                {isLoading && <LoadingSpinner message="Whispering to your heart..."/>}

                {!isLoading && moodResponse && (
                    <div className="animate-fade-in space-y-8 flex flex-col items-center">
                        <div className="text-7xl animate-subtle-float-pulse drop-shadow-lg">{moodResponse.emoji_hint}</div>
                        <p className="text-2xl md:text-3xl font-nunito text-slate-800/80 italic max-w-md">
                            "{moodResponse.caption_line}"
                        </p>
                        <AudioPlayer src={activeMood.audioSrc} />
                        <p className="text-xs text-slate-600/70 font-nunito">*Audio is a placeholder. Real voice notes from Soumyajeet will be here!*</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="container mx-auto pb-8 animate-content-fade-in">
            <h1 className="text-3xl font-bold text-pink-600 mb-2">Impulse Heart</h1>
            <p className="text-slate-600 font-nunito mb-8">A little something for every feeling. How are you, my love?</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {moods.map((mood, index) => (
                    <GlassCard 
                        key={mood.id} 
                        onClick={() => handleMoodSelect(mood)}
                        className="aspect-square flex flex-col items-center justify-center gap-2 text-center p-4 transform hover:scale-105 hover:-translate-y-1 transition-transform duration-300"
                        style={{animation: `content-fade-in 0.5s ${index * 50}ms ease-out forwards`, opacity: 0}}
                    >
                        <div className="text-5xl">{mood.emoji}</div>
                        <p className="font-semibold text-slate-700">{mood.label}</p>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

export default ImpulseHeartPage;
