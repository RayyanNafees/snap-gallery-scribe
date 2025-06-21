
import React, { useRef, useEffect, useState } from 'react';
import { X, RotateCcw, Images } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RecentPicsModal from './RecentPicsModal';

interface CameraViewProps {
  onClose: () => void;
  onCapture: (imageUrl: string) => void;
  recentImages: string[];
  onUpload: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onClose, onCapture, recentImages, onUpload }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRecentPics, setShowRecentPics] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const startCamera = async (facing: 'user' | 'environment' = 'environment') => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by your browser');
      }

      // Request camera access with proper constraints
      const constraints = {
        video: { 
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          facingMode: facing,
          aspectRatio: { ideal: 16/9 }
        },
        audio: false
      };

      console.log('Requesting camera access...');
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted, setting up video...');
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        
        // Wait for video to be ready and start playing
        const videoElement = videoRef.current;
        
        const handleCanPlay = () => {
          console.log('Video can play, starting playback...');
          videoElement.play()
            .then(() => {
              console.log('Video is now playing');
              setHasPermission(true);
              setIsLoading(false);
              setError(null);
            })
            .catch(err => {
              console.error('Error playing video:', err);
              setError('Failed to start video playback');
              setIsLoading(false);
            });
        };

        const handleLoadedMetadata = () => {
          console.log('Video metadata loaded');
        };

        videoElement.addEventListener('canplay', handleCanPlay);
        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        
        // Cleanup event listeners
        const cleanup = () => {
          videoElement.removeEventListener('canplay', handleCanPlay);
          videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };

        // Store cleanup function
        videoElement.dataset.cleanup = 'true';
        
        setStream(newStream);
        
        // Fallback timeout
        setTimeout(() => {
          if (isLoading && videoElement.readyState >= 2) {
            handleCanPlay();
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsLoading(false);
      setHasPermission(false);
      
      let errorMessage = 'Unable to access camera';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera access and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please make sure your camera is connected.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'Camera does not support the requested settings.';
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCameraFlip = async () => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode);
    await startCamera(newFacingMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 image
    const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCapture(imageUrl);
    
    toast({
      title: "Photo captured!",
      description: "Your photo has been saved to the gallery",
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Starting camera...</p>
          <p className="text-sm text-gray-400 mt-2">Please allow camera access when prompted</p>
        </div>
      </div>
    );
  }

  if (error || !hasPermission) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-center p-8 max-w-md">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
            <X className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Camera Access Issue</h2>
          <p className="text-gray-300 mb-6">
            {error || 'Camera access is required to use this feature'}
          </p>
          {!error && (
            <div className="text-left text-gray-300 mb-8 space-y-2 text-sm">
              <p>• Click the camera icon in your browser's address bar</p>
              <p>• Select "Allow" for camera access</p>
              <p>• Make sure no other app is using your camera</p>
            </div>
          )}
          <div className="space-y-4">
            <button
              onClick={() => startCamera(facingMode)}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Full-screen camera video */}
      <div className="relative w-full h-full overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Top close button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={onClose}
            className="w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="flex items-center justify-center gap-12 max-w-md mx-auto">
            {/* Camera flip button */}
            <button
              onClick={handleCameraFlip}
              className="w-14 h-14 border-2 border-white/70 hover:border-white rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <RotateCcw className="w-7 h-7 text-white" />
            </button>

            {/* Capture button */}
            <button
              onClick={capturePhoto}
              className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform active:scale-95"
            >
              <div className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-inner"></div>
            </button>

            {/* Recent pics button with thumbnail */}
            <button
              onClick={() => setShowRecentPics(true)}
              className="relative w-14 h-14 border-2 border-white/70 hover:border-white rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-all backdrop-blur-sm overflow-hidden"
            >
              {recentImages.length > 0 ? (
                <img
                  src={recentImages[0]}
                  alt="Latest capture"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <Images className="w-7 h-7 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Recent Pictures Modal */}
      {showRecentPics && (
        <RecentPicsModal
          images={recentImages}
          onClose={() => setShowRecentPics(false)}
        />
      )}
    </div>
  );
};

export default CameraView;
