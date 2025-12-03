import React, { useState, useEffect } from 'react';
import { ConnectForm } from './ConnectForm';
import { ScreenViewer } from './ScreenViewer';
import { ConnectionStatus } from '../layout/ConnectionStatus';
import { useSocket } from '../../hooks/useSocket';
import { usePeerConnection } from '../../hooks/usePeerConnection';
import { validateRoomCode } from '../../../../shared/utils/validators';
import { ConnectionStatus as ConnectionStatusType } from '../../types';

interface ViewerControllerProps {
  onConnectionChange?: (connected: boolean) => void;
}

export const ViewerController: React.FC<ViewerControllerProps> = ({
  onConnectionChange,
}) => {
  const [roomCode, setRoomCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusType>('disconnected');
  const [error, setError] = useState<string | null>(null);

  const { socket, connect, disconnect, emit, on, off } = useSocket();
  const {
    remoteStream,
    initialize,
    handleOffer,
    handleAnswer,
    addIceCandidate,
    close,
  } = usePeerConnection();

  useEffect(() => {
    if (socket) {
      // Handle room joined
      on('room-joined', (data: { roomCode: string; success: boolean }) => {
        if (data.success) {
          setConnectionStatus('connected');
          setIsConnected(true);
          setError(null);
          onConnectionChange?.(true);
        } else {
          setConnectionStatus('error');
          setError('Failed to join room');
        }
      });

      // Handle WebRTC offer from host
      on('webrtc-offer', async (data: { offer: RTCSessionDescriptionInit }) => {
        try {
          const answer = await handleOffer(data.offer);
          if (answer) {
            emit('webrtc-answer', { answer });
          }
        } catch (err) {
          console.error('Failed to handle offer:', err);
          setError('Failed to establish connection');
        }
      });

      // Handle WebRTC answer (if needed)
      on('webrtc-answer', async (data: { answer: RTCSessionDescriptionInit }) => {
        try {
          await handleAnswer(data.answer);
        } catch (err) {
          console.error('Failed to handle answer:', err);
        }
      });

      // Handle ICE candidates
      on('ice-candidate', async (data: { candidate: RTCIceCandidateInit }) => {
        try {
          await addIceCandidate(data.candidate);
        } catch (err) {
          console.error('Failed to add ICE candidate:', err);
        }
      });

      // Handle disconnection
      on('room-left', () => {
        setConnectionStatus('disconnected');
        setIsConnected(false);
        setError(null);
        onConnectionChange?.(false);
        close();
      });

      // Handle errors
      on('error', (data: { message: string }) => {
        setError(data.message);
        setConnectionStatus('error');
      });

      return () => {
        off('room-joined');
        off('webrtc-offer');
        off('webrtc-answer');
        off('ice-candidate');
        off('room-left');
        off('error');
      };
    }
  }, [socket, on, off, emit, handleOffer, handleAnswer, addIceCandidate, close, onConnectionChange]);

  const handleConnect = async (code: string) => {
    if (!validateRoomCode(code)) {
      setError('Invalid room code format');
      return;
    }

    setRoomCode(code.toUpperCase());
    setConnectionStatus('connecting');
    setError(null);

    try {
      await connect();
      await initialize();
      emit('join-room', { roomCode: code.toUpperCase() });
    } catch (err) {
      console.error('Failed to connect:', err);
      setConnectionStatus('error');
      setError('Failed to connect to server');
    }
  };

  const handleDisconnect = () => {
    emit('leave-room', { roomCode });
    disconnect();
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setError(null);
    onConnectionChange?.(false);
    close();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Screen Share Viewer
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Enter a room code to join a screen sharing session
              </p>
            </div>

            <ConnectForm onConnect={handleConnect} disabled={connectionStatus === 'connecting'} />

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <ConnectionStatus status={connectionStatus} className="mt-6" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Viewing Room: {roomCode}
              </h1>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Disconnect
              </button>
            </div>

            <ScreenViewer stream={remoteStream} />

            <ConnectionStatus status={connectionStatus} />
          </div>
        )}
      </div>
    </div>
  );
};
