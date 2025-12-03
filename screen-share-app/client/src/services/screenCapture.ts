export class ScreenCaptureService {
  private static instance: ScreenCaptureService;
  private stream: MediaStream | null = null;

  static getInstance(): ScreenCaptureService {
    if (!ScreenCaptureService.instance) {
      ScreenCaptureService.instance = new ScreenCaptureService();
    }
    return ScreenCaptureService.instance;
  }

  async startCapture(options: MediaStreamConstraints = {}): Promise<MediaStream> {
    try {
      // Check if screen capture is supported
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen capture is not supported in this browser');
      }

      // Default options for screen capture
      const defaultOptions: MediaStreamConstraints = {
        video: {
          // mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: false,
        ...options,
      };

      this.stream = await navigator.mediaDevices.getDisplayMedia(defaultOptions);

      // Handle stream end
      this.stream.getVideoTracks()[0].addEventListener('ended', () => {
        this.stopCapture();
      });

      return this.stream;
    } catch (error) {
      console.error('Failed to start screen capture:', error);
      throw error;
    }
  }

  stopCapture(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  getCurrentStream(): MediaStream | null {
    return this.stream;
  }

  isCapturing(): boolean {
    return this.stream !== null && this.stream.active;
  }
}

export const screenCaptureService = ScreenCaptureService.getInstance();
