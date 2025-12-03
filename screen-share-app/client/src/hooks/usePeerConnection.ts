import { useState, useRef, useCallback } from 'react';

interface UsePeerConnectionReturn {
  peerConnection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  initialize: () => Promise<void>;
  createOffer: () => Promise<RTCSessionDescriptionInit | null>;
  handleOffer: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit | null>;
  handleAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  addIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  setLocalStream: (stream: MediaStream) => void;
  close: () => void;
}

export const usePeerConnection = (): UsePeerConnectionReturn => {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const initialize = useCallback(async () => {
    try {
      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });

      pcRef.current = pc;
      setPeerConnection(pc);

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // This will be handled by the socket hook
          console.log('ICE candidate generated:', event.candidate);
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
      };

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('Remote track received:', event.streams[0]);
        setRemoteStream(event.streams[0]);
      };

      // Handle negotiation needed
      pc.onnegotiationneeded = async () => {
        console.log('Negotiation needed');
      };

    } catch (error) {
      console.error('Failed to initialize peer connection:', error);
      throw error;
    }
  }, []);

  const createOffer = useCallback(async (): Promise<RTCSessionDescriptionInit | null> => {
    if (!pcRef.current) {
      throw new Error('Peer connection not initialized');
    }

    try {
      // Add local stream tracks to peer connection
      if (localStream) {
        localStream.getTracks().forEach(track => {
          pcRef.current!.addTrack(track, localStream);
        });
      }

      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

      return offer;
    } catch (error) {
      console.error('Failed to create offer:', error);
      return null;
    }
  }, [localStream]);

  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit | null> => {
    if (!pcRef.current) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));

      // Add local stream tracks to peer connection
      if (localStream) {
        localStream.getTracks().forEach(track => {
          pcRef.current!.addTrack(track, localStream);
        });
      }

      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      return answer;
    } catch (error) {
      console.error('Failed to handle offer:', error);
      return null;
    }
  }, [localStream]);

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit): Promise<void> => {
    if (!pcRef.current) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Failed to handle answer:', error);
      throw error;
    }
  }, []);

  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit): Promise<void> => {
    if (!pcRef.current) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Failed to add ICE candidate:', error);
      throw error;
    }
  }, []);

  const setLocalStreamState = useCallback((stream: MediaStream) => {
    setLocalStream(stream);
  }, []);

  const close = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
      setPeerConnection(null);
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    setRemoteStream(null);
  }, [localStream]);

  return {
    peerConnection,
    localStream,
    remoteStream,
    initialize,
    createOffer,
    handleOffer,
    handleAnswer,
    addIceCandidate,
    setLocalStream: setLocalStreamState,
    close,
  };
};
