import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Memory } from '../types';
import GlassCard from '../components/GlassCard';
import { generateCaptionForImage } from '../services/geminiService';
import { Upload, X, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { seedMemories } from '../data/seed';

// --- IndexedDB Service Logic for persistent storage ---
// This replaces localStorage to handle larger image files and provide robust storage.

const DB_NAME = 'PitPatDB';
const DB_VERSION = 1;
const STORE_NAME = 'memories';

let dbPromise: Promise<IDBDatabase> | null = null;

const openDB = (): Promise<IDBDatabase> => {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
  return dbPromise;
};

const getAllMemoriesDB = async (): Promise<Memory[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject('Error fetching memories');
    request.onsuccess = () => {
      const memories = request.result.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());
      resolve(memories);
    };
  });
};

const addMemoryDB = async (memory: Memory): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(memory);

    request.onerror = () => reject('Error adding memory');
    request.onsuccess = () => resolve();
  });
};

const deleteMemoryDB = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => reject('Error deleting memory');
    request.onsuccess = () => resolve();
  });
};

// One-time migration from localStorage and/or seeding the DB
const migrateAndSeedDB = async () => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const countRequest = store.count();

    return new Promise<void>((resolve) => {
        countRequest.onsuccess = () => {
            if (countRequest.result > 0) {
                // DB already has data, no migration or seeding needed.
                return resolve();
            }

            const storedMemories = localStorage.getItem('pitpatMemories');
            if (storedMemories) {
                console.log("Migrating memories from localStorage to IndexedDB...");
                try {
                    const memories: Memory[] = JSON.parse(storedMemories);
                    memories.forEach(memory => store.add(memory));
                    
                    transaction.oncomplete = () => {
                        console.log("Migration complete. Clearing localStorage.");
                        localStorage.removeItem('pitpatMemories');
                        resolve();
                    };
                    transaction.onerror = (e) => {
                        console.error("Migration failed:", e);
                        resolve();
                    }
                } catch (error) {
                    console.error("Error parsing localStorage memories during migration.", error);
                    localStorage.removeItem('pitpatMemories'); // Clear corrupted data
                    // Proceed to seeding
                    seedMemories.forEach(memory => store.add(memory));
                    resolve();
                }
            } else {
                // No localStorage data, so seed initial data.
                console.log("No memories found, seeding initial data to IndexedDB.");
                seedMemories.forEach(memory => store.add(memory));
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => resolve();
            }
        };
        countRequest.onerror = () => {
            console.error("Could not count items in DB for migration/seeding.");
            resolve();
        };
    });
};


const MemoriesPage: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const loadMemories = async () => {
      setIsLoading(true);
      await migrateAndSeedDB();
      const memoriesFromDB = await getAllMemoriesDB();
      setMemories(memoriesFromDB);
      setIsLoading(false);
    };
    loadMemories();
  }, []);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onerror = () => {
      console.error('FileReader error:', reader.error);
      setIsLoading(false);
      // You could add a user-facing error message here
    };

    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;

        if (!dataUrl || typeof dataUrl !== 'string') {
          throw new Error('Could not read file data.');
        }

        const parts = dataUrl.split(',');
        if (parts.length < 2 || !parts[1]) {
          throw new Error('Invalid data URL format.');
        }
        const base64 = parts[1];

        const { caption, mood } = await generateCaptionForImage(base64);
        const newMemory: Memory = {
          id: new Date().toISOString(),
          imageUrl: dataUrl,
          imageB64: base64,
          caption,
          mood,
          date: new Date().toLocaleDateString(),
        };

        await addMemoryDB(newMemory);
        setMemories(prev => [newMemory, ...prev]);

        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      } catch (error) {
        console.error('Failed to process image:', error);
        // You could add a user-facing error message here
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteMemory = async (id: string) => {
    await deleteMemoryDB(id);
    setMemories(prev => prev.filter(m => m.id !== id));
    setSelectedMemory(null);
  };

  const confirmDeleteMemory = async (id: string) => {
    if (navigator.vibrate) navigator.vibrate(200); // Stronger haptic for deletion
    setDeletingId(id);
    setMemoryToDelete(null); // Close confirmation modal
    setTimeout(async () => {
      await handleDeleteMemory(id);
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
     if (typeof (window as any).Shake !== 'undefined') {
        const shakeEvent = new (window as any).Shake({ threshold: 15, timeout: 1000 });
        shakeEvent.start();
        window.addEventListener('shake', handleShake, false);
        return () => {
            window.removeEventListener('shake', handleShake, false);
            shakeEvent.stop();
        };
    }
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

      {isLoading && memories.length === 0 && <LoadingSpinner message="Loading memories..." />}
      
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
                        onClick={async () => {
                          if (navigator.vibrate) navigator.vibrate(10);
                          if (memoryToDelete) await confirmDeleteMemory(memoryToDelete);
                        }} 
                        className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-semibold"
                    >
                        Delete
                    </button>
                </div>
            </GlassCard>
        </div>
      )}

      {isLoading && memories.length > 0 && (
         <div className="fixed bottom-24 right-4 z-50">
            <LoadingSpinner message="Creating..." />
         </div>
      )}
    </div>
  );
};

export default MemoriesPage;