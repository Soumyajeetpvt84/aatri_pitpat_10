import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Memory } from '../types';
import GlassCard from '../components/GlassCard';
import { generateCaptionForImage } from '../services/geminiService';
import { Upload, X, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { seedMemories } from '../data/seed';

const MemoriesPage: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const storedMemories = localStorage.getItem('pitpatMemories');
    if (storedMemories) {
      try {
        setMemories(JSON.parse(storedMemories));
      } catch (error) {
        console.error("Error parsing memories from localStorage, falling back to seed data.", error);
        localStorage.removeItem('pitpatMemories');
        setMemories(seedMemories);
      }
    } else {
      // If no memories in storage, initialize with seed data for a better first-time experience
      setMemories(seedMemories);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    
    if (memories.length > 0) {
        localStorage.setItem('pitpatMemories', JSON.stringify(memories));
    } else {
        localStorage.removeItem('pitpatMemories');
    }
  }, [memories, isInitialized]);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      try {
        const { caption, mood } = await generateCaptionForImage(base64);
        const newMemory: Memory = {
          id: new Date().toISOString(),
          imageUrl: dataUrl, // Persist the full data URL
          imageB64: base64,
          caption,
          mood,
          date: new Date().toLocaleDateString(),
        };
        setMemories(prev => [newMemory, ...prev]);
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]); // Success haptic
      } catch (error) {
        console.error("Failed to process image:", error);
      } finally {
        setIsLoading(false);
      }
    };
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
    setSelectedMemory(null);
  };

  const confirmDeleteMemory = (id: string) => {
    if (navigator.vibrate) navigator.vibrate(200); // Stronger haptic for deletion
    setDeletingId(id);
    setMemoryToDelete(null); // Close confirmation modal
    setTimeout(() => {
      handleDeleteMemory(id);
      setDeletingId(null); // Reset animation state
    }, 400); // Must match animation duration
  }

  const showRandomMemory = useCallback(() => {
    if (memories.length > 0) {
        if (navigator.vibrate) navigator.vibrate(100); // Gesture haptic
        const randomIndex = Math.floor(Math.random() * memories.length);
        setSelectedMemory(memories[randomIndex]);
    }
  }, [memories]);

  useEffect(() => {
    const handleShake = () => showRandomMemory();
    window.addEventListener('shake', handleShake, false);
    return () => window.removeEventListener('shake', handleShake, false);
  }, [showRandomMemory]);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-pink-600">Memory Lane</h1>
        <button
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
            fileInputRef.current?.click();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 rounded-lg text-white backdrop-blur-sm hover:bg-pink-600 transition-colors"
        >
          <Upload size={20} /> Add Memory
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" capture="environment" className="hidden" />
      </div>

      {isLoading && !selectedMemory && <LoadingSpinner message="Creating your memory..." />}
      
      {memories.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <p className="text-slate-500 font-nunito">Your memory lane is waiting to be filled.</p>
          <p className="text-slate-400 font-nunito text-sm">Tap 'Add Memory' to start your collection.</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {memories.map(memory => (
          <GlassCard key={memory.id} onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
            setSelectedMemory(memory);
          }} className={`aspect-square transition-all duration-300 ${deletingId === memory.id ? 'animate-memory-fade-out' : ''}`}>
            <img src={memory.imageUrl} alt={memory.caption} className="w-full h-full object-cover" />
          </GlassCard>
        ))}
      </div>

      {selectedMemory && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedMemory(null)}>
          <GlassCard className="w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <img src={selectedMemory.imageUrl} alt={selectedMemory.caption} className="w-full object-contain" />
              <button onClick={(e) => { 
                e.stopPropagation(); 
                if (navigator.vibrate) navigator.vibrate(50);
                setMemoryToDelete(selectedMemory.id); 
              }} className="absolute top-2 left-2 p-2 bg-white/50 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                <Trash2 size={24} />
              </button>
              <button onClick={(e) => { 
                e.stopPropagation(); 
                if (navigator.vibrate) navigator.vibrate(10);
                setSelectedMemory(null); 
              }} className="absolute top-2 right-2 p-2 bg-white/50 rounded-full text-slate-800">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-slate-700 italic">"{selectedMemory.caption}"</p>
              <p className="text-sm text-pink-500">{selectedMemory.date}</p>
            </div>
          </GlassCard>
        </div>
      )}

      {memoryToDelete && (
        <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setMemoryToDelete(null)}>
            <GlassCard className="w-full max-w-sm p-8 text-center animate-pookie-in" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-slate-800">Delete this memory?</h3>
                <p className="text-slate-600 my-4">This action is permanent and cannot be undone.</p>
                <div className="flex justify-center gap-4 mt-6">
                    <button 
                        onClick={() => {
                          if (navigator.vibrate) navigator.vibrate(10);
                          setMemoryToDelete(null);
                        }} 
                        className="px-6 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors font-semibold"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                          if (navigator.vibrate) navigator.vibrate(10);
                          memoryToDelete && confirmDeleteMemory(memoryToDelete);
                        }} 
                        className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-semibold"
                    >
                        Delete
                    </button>
                </div>
            </GlassCard>
        </div>
      )}
    </div>
  );
};

export default MemoriesPage;