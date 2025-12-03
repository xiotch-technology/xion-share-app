import React, { useRef, useEffect } from 'react';
import { Loader } from '../common/Loader';
import { cn } from '../../utils/cn';

interface ScreenViewerProps {
  stream: MediaStream | null;
  className?: string;
}

export const ScreenViewer: React.FC<ScreenViewerProps> = ({
  stream,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-black rounded-lg",
        "min-h-[400px] border-2 border-dashed border-gray-300 dark:border-gray-600",
        className
      )}>
        <div className="text-center text-white">
          <Loader size="lg" className="mb-4" />
          <p className="text-lg font-medium">Waiting for screen share...</p>
          <p className="text-sm text-gray-400 mt-2">
            The host will start sharing their screen shortly
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative bg-black rounded-lg overflow-hidden", className)}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-contain"
        style={{ maxHeight: '80vh' }}
      />

      {/* Connection quality indicator */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center space-x-2 bg-black bg-opacity-50 rounded-full px-3 py-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-white text-sm font-medium">Live</span>
        </div>
      </div>

      {/* Fullscreen button */}
      <button
        onClick={() => {
          if (videoRef.current?.requestFullscreen) {
            videoRef.current.requestFullscreen();
          }
        }}
        className="absolute bottom-4 right-4 p-2 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full text-white transition-colors"
        title="Fullscreen"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 3l-6 6m0 0V3m0 6h6M3 21l6-6m0 0v6m0-6H3" />
        </svg>
      </button>
    </div>
  );
};
