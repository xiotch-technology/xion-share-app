import React, { useState, useEffect } from 'react';
import { ScreenCapture } from './ScreenCapture';
import { ShareCode } from './ShareCode';
import { ConnectionStatus } from '../layout/ConnectionStatus';
import { useSocket } from '../../hooks/useSocket';
import { usePeerConnection } from '../../hooks/usePeerConnection';

import { ConnectionStatus as ConnectionStatusType } from '../../types';

export const HostController: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusType>('disconnected');
  const [viewerCount, setViewerCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { socket, connect, disconnect, emit, on, off } = useSocket();
  const {
    localStream,
    initialize,
    handleAnswer,
    addIceCandidate,
    createOffer,
    close,
  } = usePeerConnection();

  useEffect(() => {
    if (socket) {
      // Handle room creation response
      on('room-created', (data: { roomCode: string; success: boolean }) => {
        if (data.success) {
          setRoomCode(data.roomCode);
          setConnectionStatus('connected');
          setError(null);
        } else {
          setConnectionStatus('error');
          setError('Failed to create room');
        }
      });

      // Handle viewer joined
      on('viewer-joined', (data: { viewerId: string; viewerCount: number }) => {
        setViewerCount(data.viewerCount);
      });

      // Handle viewer left
      on('viewer-left', (data: { viewerId: string; viewerCount: number }) => {
        setViewerCount(data.viewerCount);
      });

      // Handle WebRTC answer from viewer
      on('webrtc-answer', async (data: { answer: RTCSessionDescriptionInit }) => {
        try {
          await handleAnswer(data.answer);
        } catch (err) {
          console.error('Failed to handle answer:', err);
          setError('Failed to establish connection with viewer');
        }
      });

      // Handle ICE candidates from viewer
      on('ice-candidate', async (data: { candidate: RTCIceCandidateInit }) => {
        try {
          await addIceCandidate(data.candidate);
        } catch (err) {
          console.error('Failed to add ICE candidate:', err);
        }
      });

      // Handle errors
      on('error', (data: { message: string }) => {
        setError(data.message);
        setConnectionStatus('error');
      });

      return () => {
        off('room-created');
        off('viewer-joined');
        off('viewer-left');
        off('webrtc-answer');
        off('ice-candidate');
        off('error');
      };
    }
  }, [socket, on, off, handleAnswer, addIceCandidate]);

  const handleStartSharing = async () => {
    try {
      setConnectionStatus('connecting');
      setError(null);

      // Connect to server
      await connect();

      // Initialize peer connection
      await initialize();

      // Create room
      emit('create-room');
    } catch (err) {
      console.error('Failed to start sharing:', err);
      setConnectionStatus('error');
      setError('Failed to start sharing');
    }
  };

  const handleStopSharing = () => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    close();

    // Disconnect from server
    emit('leave-room', { roomCode });
    disconnect();

    setIsSharing(false);
    setRoomCode('');
    setConnectionStatus('disconnected');
    setViewerCount(0);
    setError(null);
  };

  const handleRegenerateCode = () => {
    if (socket) {
      // Leave current room
      emit('leave-room', { roomCode });

      // Create new room
      emit('create-room');
    }
  };

  const handleScreenCaptureStart = async () => {
    try {
      // Create WebRTC offer
      const offer = await createOffer();

      if (offer) {
        emit('webrtc-offer', { offer });
      }

      setIsSharing(true);
    } catch (err) {
      console.error('Failed to start screen capture:', err);
      setError('Failed to start screen sharing');
    }
  };

  const handleScreenCaptureStop = () => {
    handleStopSharing();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Host Screen Sharing
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Share your screen with viewers in real-time
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <ScreenCapture
          onCaptureStart={handleScreenCaptureStart}
          onCaptureStop={handleScreenCaptureStop}
          isSharing={isSharing}
        />

        <ShareCode
          roomCode={roomCode}
          onRegenerateCode={handleRegenerateCode}
          isConnected={connectionStatus === 'connected'}
          viewerCount={viewerCount}
        />
      </div>

      <div className="flex justify-center">
        <ConnectionStatus status={connectionStatus} />
      </div>

      {!isSharing && connectionStatus !== 'connecting' && (
        <div className="text-center">
          <button
            onClick={handleStartSharing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start Sharing
          </button>
        </div>
      )}

      {isSharing && (
        <div className="text-center">
          <button
            onClick={handleStopSharing}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Stop Sharing
          </button>
        </div>
      )}
    </div>
  );
};
