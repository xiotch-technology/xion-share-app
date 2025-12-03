import { useState, useCallback } from 'react';

export const useScreenCapture = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCapture = useCallback(async (): Promise<MediaStream | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const captureStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      setStream(captureStream);
      return captureStream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to capture screen';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCapture = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setError(null);
  }, [stream]);

  return {
    stream,
    isLoading,
    error,
    startCapture,
    stopCapture,
  };
};
