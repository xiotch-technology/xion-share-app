export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface Room {
  code: string;
  hostId: string;
  viewers: string[];
  createdAt: Date;
}

export interface Session {
  id: string;
  roomCode: string;
  userId: string;
  role: 'host' | 'viewer';
  createdAt: Date;
}

export interface SocketEventData {
  roomCode?: string;
  userId?: string;
  viewerId?: string;
  viewerCount?: number;
  success?: boolean;
  error?: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export interface ScreenCaptureOptions {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
}

export interface WebRTCMessage {
  type: string;
  data: any;
}

export type PeerConnectionState = 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';
