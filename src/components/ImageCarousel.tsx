import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Images
import carousel1 from '@/assets/carousel-1.jpg';
import carousel2 from '@/assets/carousel-2.jpg';
import carousel3 from '@/assets/carousel-3.jpg';
import carousel4 from '@/assets/carousel-4.jpg';
import carousel5 from '@/assets/carousel-5.jpg';
import carousel6 from '@/assets/carousel-6.jpg';

const images = [carousel1, carousel2, carousel3, carousel4, carousel5, carousel6];

const ImageCarousel = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const snapAnimationRef = useRef<number | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isGalleryActive, setIsGalleryActive] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);

  const currentProgressRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      if (rafIdRef.current || isSnapping) return;
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        if (!sectionRef.current || !trackRef.current) return;

        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const sectionHeight = sectionRef.current.offsetHeight;

        // Visibility controls (active only while sticky phase)
        const inStickyPhase = rect.top <= 0 && rect.bottom >= windowHeight;
        if (inStickyPhase !== showCarousel) setShowCarousel(inStickyPhase);
        if (inStickyPhase !== isGalleryActive) setIsGalleryActive(inStickyPhase);

        // Progress calculation
        const scrolled = Math.max(0, -rect.top);
        const maxScroll = Math.max(1, sectionHeight - windowHeight);
        const rawProgress = Math.min(1, Math.max(0, scrolled / maxScroll));
        
        // Delay start of carousel movement
        const startThreshold = 0.15;
        const progress = rawProgress < startThreshold ? 0 : (rawProgress - startThreshold) / (1 - startThreshold);
        
        currentProgressRef.current = progress;

        // Update progress bar
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${rawProgress * 100}%`;
        }

        updateCarouselPosition(progress);

        // Auto-snap: Clear existing timeout and set new one
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        // Only enable snapping when gallery is fully active
        if (inStickyPhase && progress > 0 && progress < 1) {
          scrollTimeoutRef.current = setTimeout(() => {
            if (isGalleryActive && !isSnapping) {
              startSnapAnimation();
            }
          }, 150);
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (snapAnimationRef.current) cancelAnimationFrame(snapAnimationRef.current);
    };
  }, [isGalleryActive, showCarousel, activeIndex, isSnapping]);

  const updateCarouselPosition = (progress: number) => {
    if (!trackRef.current) return;

    // Calculate current center image
    const centerIndex = progress * (images.length - 1);
    const newActiveIndex = Math.round(centerIndex);
    if (newActiveIndex !== activeIndex) {
      setActiveIndex(newActiveIndex);
    }

    // Move track horizontally
    const imageWidth = 368; // 320px + 48px gap
    const containerWidth = window.innerWidth;
    const startOffset = containerWidth / 2 - 160; // Center first image
    const translateX = startOffset - (progress * imageWidth * (images.length - 1));
    
    trackRef.current.style.transform = `translate3d(${translateX}px, 0, 0)`;

    // Update image styles
    images.forEach((_, index) => {
      const distance = Math.abs(index - centerIndex);
      const imageEl = trackRef.current?.children[index] as HTMLElement;
      
      if (imageEl) {
        if (distance < 0.1) {
          // Center image
          imageEl.style.transform = 'scale(1.25)';
          imageEl.style.opacity = '1';
          imageEl.style.filter = 'brightness(1.1) saturate(1.1)';
          imageEl.style.boxShadow = '0 20px 40px rgba(255, 165, 132, 0.4)';
          imageEl.style.zIndex = '20';
        } else if (distance < 1) {
          // Adjacent images
          const scale = 1.25 - (distance * 0.4);
          const opacity = 1 - (distance * 0.4);
          imageEl.style.transform = `scale(${scale})`;
          imageEl.style.opacity = opacity.toString();
          imageEl.style.filter = 'brightness(0.9) saturate(0.9)';
          imageEl.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
          imageEl.style.zIndex = '10';
        } else {
          // Far images
          const scale = Math.max(0.5, 1.25 - (distance * 0.3));
          const opacity = Math.max(0.3, 1 - (distance * 0.3));
          imageEl.style.transform = `scale(${scale})`;
          imageEl.style.opacity = opacity.toString();
          imageEl.style.filter = 'brightness(0.7) saturate(0.7)';
          imageEl.style.boxShadow = '0 5px 10px rgba(0, 0, 0, 0.2)';
          imageEl.style.zIndex = '5';
        }
        
        imageEl.style.transition = isSnapping ? 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'all 0.3s ease-out';
      }
    });
  };

  const startSnapAnimation = () => {
    const currentProgress = currentProgressRef.current;
    const nearestIndex = Math.round(currentProgress * (images.length - 1));
    const targetProgress = nearestIndex / (images.length - 1);
    
    // Don't animate if already very close
    if (Math.abs(currentProgress - targetProgress) < 0.02) return;
    
    setIsSnapping(true);
    
    const startProgress = currentProgress;
    const progressDiff = targetProgress - startProgress;
    const duration = 500;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      // Smooth easing
      const eased = 1 - Math.pow(1 - progress, 3);
      const newProgress = startProgress + progressDiff * eased;
      
      currentProgressRef.current = newProgress;
      updateCarouselPosition(newProgress);
      
      if (progress < 1) {
        snapAnimationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSnapping(false);
        snapAnimationRef.current = null;
      }
    };
    
    snapAnimationRef.current = requestAnimationFrame(animate);
  };

  const skipGallery = () => {
    if (!sectionRef.current) return;
    const sectionBottom = sectionRef.current.offsetTop + sectionRef.current.offsetHeight;
    window.scrollTo(0, sectionBottom);
  };

  return (
    <section
      ref={sectionRef}
      data-section="carousel"
      className="h-[200vh] relative bg-gradient-to-b from-background to-card"
    >
      {/* Fixed title & controls */}
      <div
        className={`fixed top-20 left-1/2 -translate-x-1/2 text-center z-30 transition-opacity duration-500 ${
          isGalleryActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          Scroll to Explore Gallery
        </h2>
        <p className="text-muted-foreground mb-6">
          Keep scrolling to see the horizontal carousel in action
        </p>
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

      {/* Carousel viewport */}
      <div className="sticky top-1/2 -translate-y-1/2 h-80 overflow-hidden">
        <div
          ref={trackRef}
          className={`flex items-center gap-12 ${showCarousel ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
          style={{ willChange: 'transform' }}
        >
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className="relative rounded-xl overflow-hidden flex-shrink-0"
              style={{ width: '320px', height: '200px' }}
            >
              <img
                src={img}
                alt={`Gallery image ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {idx + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-30 transition-opacity duration-500 ${
          isGalleryActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-background/80 backdrop-blur-sm rounded-full px-6 py-3 border border-border">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Progress:</span>
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div ref={progressBarRef} className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-100" />
            </div>
            <span className="text-sm text-foreground font-mono">
              {activeIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageCarousel;