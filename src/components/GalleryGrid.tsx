
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface GalleryGridProps {
  images: string[];
  onDeleteImage: (index: number) => void;
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ images, onDeleteImage }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleImageClick = (image: string, index: number) => {
    setSelectedImage(image);
    setSelectedIndex(index);
  };

  const handleDelete = () => {
    if (selectedIndex !== null) {
      onDeleteImage(selectedIndex);
      setSelectedImage(null);
      setSelectedIndex(null);
    }
  };

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No photos yet</h3>
        <p className="text-gray-400 max-w-md">
          Start capturing memories by tapping the camera button below. Your photos will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer group hover:scale-105 transition-transform duration-200"
            onClick={() => handleImageClick(image, index)}
          >
            <img
              src={image}
              alt={`Captured image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>
        ))}
      </div>

      {/* Full screen image modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            {/* Delete button */}
            <button
              onClick={handleDelete}
              className="absolute top-4 left-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg backdrop-blur-sm transition-colors z-10"
            >
              Delete
            </button>
            
            <img
              src={selectedImage}
              alt="Full size view"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryGrid;
