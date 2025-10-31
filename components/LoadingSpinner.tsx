
import React from 'react';
import { Heart } from 'lucide-react';

interface LoadingSpinnerProps {
    message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Thinking..." }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 text-pink-200">
      <Heart className="w-12 h-12 animate-ping text-pink-400" />
      <p className="text-lg font-nunito">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
