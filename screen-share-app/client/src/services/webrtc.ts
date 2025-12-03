import { io, Socket } from 'socket.io-client';

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private socket: Socket;
  
  constructor(signalingServer: string) {
    this.socket = io(signalingServer);
  }
  
  async startScreenShare(roomId: string): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getDisplayMedia();
    this.localStream = stream;
    return stream;
  }
  
  disconnect(): void {
    if (this.peerConnection) this.peerConnection.close();
    if (this.localStream) this.localStream.getTracks().forEach(t => t.stop());
    this.socket.disconnect();
  }
}
