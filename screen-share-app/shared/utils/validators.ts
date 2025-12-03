export const validateRoomCode = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(code);
};

export const validateUserId = (userId: string): boolean => {
  return typeof userId === 'string' && userId.length > 0 && userId.length <= 100;
};

export const validateWebRTCSupport = (): { supported: boolean; error?: string } => {
  try {
    // Check if WebRTC is supported
    const RTCPeerConnection = window.RTCPeerConnection ||
                             (window as any).webkitRTCPeerConnection ||
                             (window as any).mozRTCPeerConnection;

    if (!RTCPeerConnection) {
      return { supported: false, error: 'WebRTC is not supported in this browser' };
    }

    // Check if getUserMedia is supported
    const getUserMedia = navigator.mediaDevices?.getUserMedia ||
                        (navigator as any).webkitGetUserMedia ||
                        (navigator as any).mozGetUserMedia;

    if (!getUserMedia) {
      return { supported: false, error: 'getUserMedia is not supported in this browser' };
    }

    return { supported: true };
  } catch (error) {
    return { supported: false, error: 'Failed to check WebRTC support' };
  }
};
