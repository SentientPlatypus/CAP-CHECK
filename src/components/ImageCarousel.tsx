import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

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
  const [isGalleryActive, setIsGalleryActive] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = sectionRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Show carousel when section starts coming into view
      const shouldShowCarousel = rect.top < windowHeight * 0.8;
      setShowCarousel(shouldShowCarousel);
      
      // Show controls when carousel section is fully visible or mostly visible
      const isInView = rect.top <= 0 && rect.bottom >= windowHeight * 0.5;
      setIsGalleryActive(isInView);
      
      // Better progress calculation to ensure we reach 100%
      const scrolled = Math.max(0, -rect.top);
      const maxScroll = sectionHeight - windowHeight;
      const progress = Math.min(1, Math.max(0, scrolled / maxScroll));
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const skipGallery = () => {
    if (sectionRef.current) {
      const sectionBottom = sectionRef.current.offsetTop + sectionRef.current.offsetHeight;
      window.scrollTo({
        top: sectionBottom,
        behavior: 'smooth'
      });
    }
  };

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
      data-section="carousel"
      className="h-[200vh] relative bg-gradient-to-b from-background to-card"
    >
      {/* Fixed title that stays throughout gallery */}
      <div 
        className={`fixed top-20 left-1/2 transform -translate-x-1/2 text-center z-30 transition-opacity duration-300 ${
          isGalleryActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          Scroll to Explore Gallery
        </h2>
        <p className="text-muted-foreground mb-6">
          Keep scrolling to see the horizontal carousel in action
        </p>
        
        {/* Skip button */}
        <button
          onClick={skipGallery}
          className="bg-secondary/80 hover:bg-secondary text-secondary-foreground px-6 py-3 rounded-full transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-border"
        >
          <div className="flex items-center space-x-2">
            <span>Skip Gallery</span>
            <ChevronDown size={18} />
          </div>
        </button>
      </div>

      {/* Sticky carousel container */}
      <div className="sticky top-1/2 transform -translate-y-1/2 h-80 overflow-hidden">
        <div 
          className={`relative h-full flex justify-center items-center transition-opacity duration-500 ${
            showCarousel ? 'opacity-100' : 'opacity-0'
          }`}
        >
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

      {/* Fixed progress indicator */}
      <div 
        className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30 transition-opacity duration-300 ${
          isGalleryActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
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