
import React, { useRef, useEffect, useState } from 'react';
import { X, Image, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CameraViewProps {
  onClose: () => void;
  onCapture: (imageUrl: string) => void;
  recentImage?: string;
  onUpload: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onClose, onCapture, recentImage, onUpload }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullImage, setShowFullImage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'environment'
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setIsLoading(false);
        toast({
          title: "Camera access denied",
          description: "Please allow camera access to use this feature",
          variant: "destructive",
        });
      }
    };

    startCamera();

    return () => {
      // Cleanup camera stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

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
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Initializing camera...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-center p-8">
          <Camera className="w-24 h-24 mx-auto mb-6 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4">Camera Access Required</h2>
          <p className="text-gray-300 mb-8 max-w-md">
            This app needs access to your camera to take photos. Please allow camera permissions and try again.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Camera video */}
      <div className="relative w-full h-full overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            {/* Recent image thumbnail */}
            <div className="w-16 h-16">
              {recentImage ? (
                <button
                  onClick={() => setShowFullImage(true)}
                  className="w-full h-full rounded-lg overflow-hidden border-2 border-white/30 hover:border-white/60 transition-colors"
                >
                  <img
                    src={recentImage}
                    alt="Recent capture"
                    className="w-full h-full object-cover"
                  />
                </button>
              ) : (
                <div className="w-full h-full rounded-lg bg-gray-700/50 border-2 border-gray-500/30"></div>
              )}
            </div>

            {/* Capture button */}
            <button
              onClick={capturePhoto}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform active:scale-95"
            >
              <div className="w-16 h-16 bg-white rounded-full border-4 border-gray-300"></div>
            </button>

            {/* Upload button */}
            <button
              onClick={onUpload}
              className="w-16 h-16 border-2 border-white/60 hover:border-white rounded-lg bg-transparent hover:bg-white/10 flex items-center justify-center transition-all"
            >
              <Image className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Full image modal */}
      {showFullImage && recentImage && (
        <div className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={recentImage}
              alt="Full size preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraView;
