import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageComparison = ({ originalImage, enhancedImage, isOpen, onClose, onNext, onPrev, currentIndex, totalImages }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      if (onPrev) {
        onPrev();
      } else {
        setSliderPosition(prev => Math.max(0, prev - 2));
      }
    } else if (e.key === 'ArrowRight') {
      if (onNext) {
        onNext();
      } else {
        setSliderPosition(prev => Math.min(100, prev + 2));
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onNext, onPrev, onClose, handleKeyDown]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isDragging, handleKeyDown, handleMouseMove, handleTouchMove, handleTouchEnd]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold">Image Comparison</h3>
            <div className="flex items-center space-x-2 text-sm">
              <span className="bg-red-500 px-2 py-1 rounded">Original</span>
              <span className="bg-green-500 px-2 py-1 rounded">Enhanced</span>
            </div>
            {totalImages > 1 && (
              <div className="text-sm text-gray-300">
                {currentIndex + 1} of {totalImages}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {totalImages > 1 && (
              <>
                <button
                  onClick={onPrev}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                  title="Previous image (←)"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={onNext}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                  title="Next image (→)"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              title="Close (ESC)"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Instructions - Mobile Responsive */}
        <div className="absolute top-16 left-0 right-0 z-10 bg-black bg-opacity-50 text-white p-2 text-center text-xs sm:text-sm">
          <div className="hidden sm:block">
            Drag the slider or use arrow keys to compare images • {totalImages > 1 ? 'Use ← → keys or click arrows to navigate • ' : ''}Press ESC to close
          </div>
          <div className="block sm:hidden">
            Drag slider or use bottom slider to compare • {totalImages > 1 ? 'Tap arrows to navigate • ' : ''}Tap X to close
          </div>
        </div>

        {/* Comparison Container */}
        <div
          ref={containerRef}
          className="relative w-full h-full cursor-col-resize"
          style={{ marginTop: '80px', height: 'calc(100% - 80px)' }}
        >
          {/* Original Image */}
          <div className="absolute inset-0">
            <img
              src={originalImage}
              alt="Original"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold">
              ORIGINAL
            </div>
          </div>

          {/* Enhanced Image */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
          >
            <img
              src={enhancedImage}
              alt="Enhanced"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold">
              ENHANCED
            </div>
          </div>

          {/* Slider */}
          <div
            ref={sliderRef}
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize z-20 touch-none"
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-8 sm:h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <div className="flex space-x-1">
                <ChevronLeft className="h-3 w-3 text-gray-600" />
                <ChevronRight className="h-3 w-3 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Slider Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
            style={{ left: `${sliderPosition}%` }}
          />
        </div>

        {/* Slider Control - Mobile Responsive */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg w-80 sm:w-auto">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="w-full h-3 sm:h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider touch-manipulation"
          />
          <div className="flex justify-between text-xs mt-1">
            <span>Original</span>
            <span>Enhanced</span>
          </div>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default ImageComparison;
