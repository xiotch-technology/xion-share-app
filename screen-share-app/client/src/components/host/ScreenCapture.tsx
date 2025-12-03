import React, { useRef, useEffect, useState } from 'react';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';
import { useScreenCapture } from '../../hooks/useScreenCapture';
import { cn } from '../../utils/cn';

interface ScreenCaptureProps {
  onCaptureStart: (stream: MediaStream) => void;
  onCaptureStop: () => void;
  isSharing: boolean;
}

export const ScreenCapture: React.FC<ScreenCaptureProps> = ({
  onCaptureStart,
  onCaptureStop,
  isSharing,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream, isLoading, error, startCapture, stopCapture } = useScreenCapture();
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      setIsPreviewing(true);
    } else {
      setIsPreviewing(false);
    }
  }, [stream]);

  const handleStartCapture = async () => {
    try {
      const captureStream = await startCapture();
      if (captureStream) {
        onCaptureStart(captureStream);
      }
    } catch (err) {
      console.error('Failed to start screen capture:', err);
    }
  };

  const handleStopCapture = () => {
    stopCapture();
    onCaptureStop();
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Screen Capture
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isSharing ? 'Your screen is being shared' : 'Select a screen to share'}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          className={cn(
            "w-full max-w-md mx-auto border rounded-lg bg-black",
            isPreviewing ? "block" : "hidden"
          )}
          style={{ aspectRatio: '16/9' }}
        />

        {!isPreviewing && !isLoading && (
          <div className="w-full max-w-md mx-auto aspect-video border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Screen preview will appear here
              </p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <Loader size="lg" />
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-3">
        {!isSharing ? (
          <Button
            onClick={handleStartCapture}
            disabled={isLoading}
            className="px-6"
          >
            {isLoading ? 'Starting...' : 'Start Sharing'}
          </Button>
        ) : (
          <Button
            onClick={handleStopCapture}
            variant="destructive"
            className="px-6"
          >
            Stop Sharing
          </Button>
        )}
      </div>
    </div>
  );
};
