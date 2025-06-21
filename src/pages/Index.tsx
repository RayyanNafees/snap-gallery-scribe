
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image, Pencil, X } from 'lucide-react';
import CameraView from '@/components/CameraView';
import TextNoteModal from '@/components/TextNoteModal';
import GalleryGrid from '@/components/GalleryGrid';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load saved images from localStorage on component mount
  useEffect(() => {
    const savedImages = localStorage.getItem('capturedImages');
    if (savedImages) {
      setCapturedImages(JSON.parse(savedImages));
    }
  }, []);

  // Save images to localStorage whenever capturedImages changes
  useEffect(() => {
    localStorage.setItem('capturedImages', JSON.stringify(capturedImages));
  }, [capturedImages]);

  const handleFabClick = () => {
    setIsFabExpanded(!isFabExpanded);
  };

  const handleCameraClick = () => {
    setShowCamera(true);
    setIsFabExpanded(false);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
    setIsFabExpanded(false);
  };

  const handlePencilClick = () => {
    setShowTextModal(true);
    setIsFabExpanded(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            setCapturedImages(prev => [imageUrl, ...prev]);
          };
          reader.readAsDataURL(file);
        }
      });
      toast({
        title: "Images uploaded successfully",
        description: `${files.length} image(s) added to your gallery`,
      });
    }
  };

  const handleImageCapture = (imageUrl: string) => {
    setCapturedImages(prev => [imageUrl, ...prev]);
    toast({
      title: "Photo captured!",
      description: "Your photo has been saved to the gallery",
    });
  };

  const handleTextSubmit = (text: string) => {
    console.log('Text note saved:', text);
    toast({
      title: "Note saved",
      description: "Your text note has been saved successfully",
    });
  };

  const handleDeleteImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Image deleted",
      description: "The image has been removed from your gallery",
    });
  };

  if (showCamera) {
    return (
      <CameraView
        onClose={() => setShowCamera(false)}
        onCapture={handleImageCapture}
        recentImage={capturedImages[0]}
        onUpload={handleImageUpload}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      
      {/* Header */}
      <div className="relative z-10 p-6 pb-4">
        <h1 className="text-3xl font-bold text-white mb-2">Camera Gallery</h1>
        <p className="text-gray-400">Capture and organize your memories</p>
      </div>

      {/* Gallery */}
      <div className="relative z-10 px-6 pb-32">
        <GalleryGrid images={capturedImages} onDeleteImage={handleDeleteImage} />
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        {/* Expanded buttons */}
        <div className={`absolute bottom-16 right-0 flex flex-col gap-4 transition-all duration-300 ${
          isFabExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
        }`}>
          <button
            onClick={handleCameraClick}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          >
            <Camera className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={handleImageUpload}
            className="w-12 h-12 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          >
            <Image className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={handlePencilClick}
            className="w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          >
            <Pencil className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Main FAB */}
        <button
          onClick={handleFabClick}
          className={`w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 ${
            isFabExpanded ? 'rotate-45' : 'rotate-0'
          }`}
        >
          {isFabExpanded ? (
            <X className="w-8 h-8 text-white" />
          ) : (
            <Camera className="w-8 h-8 text-white" />
          )}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Text Note Modal */}
      {showTextModal && (
        <TextNoteModal
          onClose={() => setShowTextModal(false)}
          onSubmit={handleTextSubmit}
        />
      )}
    </div>
  );
};

export default Index;
