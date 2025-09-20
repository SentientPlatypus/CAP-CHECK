import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import all carousel images
import carousel1 from '@/assets/carousel-1.jpg';
import carousel2 from '@/assets/carousel-2.jpg';
import carousel3 from '@/assets/carousel-3.jpg';
import carousel4 from '@/assets/carousel-4.jpg';
import carousel5 from '@/assets/carousel-5.jpg';
import carousel6 from '@/assets/carousel-6.jpg';

const images = [carousel1, carousel2, carousel3, carousel4, carousel5, carousel6];

const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getImageClass = (index: number) => {
    const diff = Math.abs(index - currentIndex);
    if (index === currentIndex) return 'carousel-item active';
    if (diff === 1 || diff === images.length - 1) return 'carousel-item side';
    return 'carousel-item far';
  };

  const getImageStyle = (index: number) => {
    const diff = index - currentIndex;
    const normalizedDiff = diff > images.length / 2 ? diff - images.length : 
                          diff < -images.length / 2 ? diff + images.length : diff;
    
    return {
      transform: `translateX(${normalizedDiff * 120}px)`,
      zIndex: index === currentIndex ? 10 : Math.max(0, 5 - Math.abs(normalizedDiff))
    };
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-8 bg-gradient-to-b from-background to-card">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Immersive Gallery
        </h2>
        
        <div className="relative h-80 flex justify-center items-center overflow-hidden">
          {images.map((image, index) => (
            <div
              key={index}
              className={getImageClass(index)}
              style={getImageStyle(index)}
            >
              <img
                src={image}
                alt={`Gallery image ${index + 1}`}
                className="w-64 h-40 object-cover cursor-pointer"
                onClick={() => setCurrentIndex(index)}
              />
            </div>
          ))}
          
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-secondary/80 hover:bg-secondary text-foreground p-3 rounded-full transition-all duration-200 hover:scale-110 z-20"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-secondary/80 hover:bg-secondary text-foreground p-3 rounded-full transition-all duration-200 hover:scale-110 z-20"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className="flex justify-center mt-8 space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-primary scale-125'
                  : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImageCarousel;