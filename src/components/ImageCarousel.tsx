import { useState, useEffect, useRef } from 'react';

// Import all carousel images
import carousel1 from '@/assets/carousel-1.jpg';
import carousel2 from '@/assets/carousel-2.jpg';
import carousel3 from '@/assets/carousel-3.jpg';
import carousel4 from '@/assets/carousel-4.jpg';
import carousel5 from '@/assets/carousel-5.jpg';
import carousel6 from '@/assets/carousel-6.jpg';

const images = [carousel1, carousel2, carousel3, carousel4, carousel5, carousel6];

const ImageCarousel = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = sectionRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the section has been scrolled through
      const scrolled = Math.max(0, windowHeight - rect.top);
      const maxScroll = sectionHeight + windowHeight;
      const progress = Math.min(1, Math.max(0, scrolled / maxScroll));
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate current image index based on scroll progress
  const getCurrentImageIndex = () => {
    return Math.floor(scrollProgress * (images.length - 1));
  };

  const getImageStyle = (index: number) => {
    const currentIndex = getCurrentImageIndex();
    const totalImages = images.length;
    
    // Calculate horizontal offset based on scroll progress
    const baseOffset = scrollProgress * (totalImages - 1) * -200;
    const imageOffset = index * 200;
    const finalX = baseOffset + imageOffset;
    
    // Calculate scale and opacity based on distance from center
    const distanceFromCenter = Math.abs(index - scrollProgress * (totalImages - 1));
    const scale = Math.max(0.4, 1 - distanceFromCenter * 0.3);
    const opacity = Math.max(0.2, 1 - distanceFromCenter * 0.4);
    
    // Z-index based on how close to center
    const zIndex = Math.max(1, 10 - Math.floor(distanceFromCenter * 2));
    
    return {
      transform: `translateX(${finalX}px) scale(${scale})`,
      opacity,
      zIndex,
      transition: 'opacity 0.1s ease-out'
    };
  };

  const getImageSize = (index: number) => {
    const currentIndex = getCurrentImageIndex();
    const distanceFromCenter = Math.abs(index - scrollProgress * (images.length - 1));
    
    if (distanceFromCenter < 0.5) {
      return 'w-96 h-64'; // Large for current image
    } else if (distanceFromCenter < 1.5) {
      return 'w-72 h-48'; // Medium for adjacent images
    } else {
      return 'w-48 h-32'; // Small for distant images
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="h-[200vh] relative bg-gradient-to-b from-background to-card"
    >
      {/* Title that fades out as we scroll */}
      <div 
        className="text-center py-20"
        style={{
          opacity: Math.max(0, 1 - scrollProgress * 2),
          transform: `translateY(${scrollProgress * 50}px)`
        }}
      >
        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Scroll to Explore Gallery
        </h2>
        <p className="text-muted-foreground mt-4">
          Keep scrolling to see the horizontal carousel in action
        </p>
      </div>

      {/* Sticky carousel container */}
      <div className="sticky top-1/2 transform -translate-y-1/2 h-80 overflow-hidden">
        <div className="relative h-full flex justify-center items-center">
          {images.map((image, index) => (
            <div
              key={index}
              className="absolute transition-transform duration-100 ease-out"
              style={getImageStyle(index)}
            >
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className={`${getImageSize(index)} object-cover`}
                />
                {/* Image overlay with index */}
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="sticky bottom-8 flex justify-center">
        <div className="bg-background/80 backdrop-blur-sm rounded-full px-6 py-3 border border-border">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Progress:</span>
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-100"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
            <span className="text-sm text-foreground font-mono">
              {Math.floor(scrollProgress * 100)}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageCarousel;