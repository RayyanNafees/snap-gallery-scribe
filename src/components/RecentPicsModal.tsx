
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface RecentPicsModalProps {
  images: string[];
  onClose: () => void;
}

const RecentPicsModal: React.FC<RecentPicsModalProps> = ({ images, onClose }) => {
  if (images.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mb-6 mx-auto">
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
          <p className="text-gray-400">
            Start capturing memories to see them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl max-h-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-10"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Carousel */}
        <Carousel className="w-full">
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="flex items-center justify-center h-[80vh]">
                  <img
                    src={image}
                    alt={`Captured image ${index + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {images.length > 1 && (
            <>
              <CarouselPrevious className="left-4 bg-black/50 hover:bg-black/70 border-white/20 text-white" />
              <CarouselNext className="right-4 bg-black/50 hover:bg-black/70 border-white/20 text-white" />
            </>
          )}
        </Carousel>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
            <span className="text-white text-sm">
              {images.length} photo{images.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentPicsModal;
