/**
 * HeroSection Component
 * 
 * Landing page hero with interactive scroll effects:
 * - Parallax text fade and scale based on scroll position
 * - Smooth scroll animation to carousel section using cubic easing
 * - Gradient background with radial overlays for visual depth
 * - Animated scroll indicator with pulsing effects
 * 
 * Performance optimizations:
 * - Uses requestAnimationFrame for smooth scroll animations
 * - Minimal re-renders with direct style manipulation
 * - Passive scroll listener for better performance
 */
import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const HeroSection = () => {
  // Track scroll position for parallax effects
  const [scrollY, setScrollY] = useState(0);

  // Set up scroll listener for parallax effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Smooth scroll to carousel section using custom easing
   * Uses requestAnimationFrame for 60fps smooth animation
   */
  const scrollToCarousel = () => {
    const carouselSection = document.querySelector('[data-section="carousel"]') as HTMLElement | null;
    if (!carouselSection) return;

    performSmoothScroll(carouselSection);
  };

  /**
   * CAP CHECK - Scroll to text reader and activate fact-checking mode
   */
  const startCapCheck = () => {
    const textReaderSection = document.querySelector('[data-section="text-reader"]') as HTMLElement | null;
    if (!textReaderSection) return;

    performSmoothScroll(textReaderSection);
    
    // Trigger CAP CHECK mode in text reader after scroll
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('startCapCheck'));
    }, 1500);
  };

  /**
   * Reusable smooth scroll function
   */
  const performSmoothScroll = (targetElement: HTMLElement) => {

    const startY = window.pageYOffset;
    const targetY = window.pageYOffset + targetElement.getBoundingClientRect().top;
    const duration = 1200; // Animation duration in milliseconds
    const startTime = performance.now();

    // Cubic easing for smooth acceleration/deceleration
    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    // Animation step function - called each frame
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, startY + (targetY - startY) * eased);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  // Parallax calculations: fade out and scale down as user scrolls
  const textOpacity = Math.max(0, 1 - scrollY / 300);  // Fade out over 300px
  const textScale = Math.max(0.5, 1 - scrollY / 600);  // Scale down to 50% over 600px

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-gradient-to-br from-background via-card to-background"
        style={{
          background: `
            radial-gradient(circle at 30% 40%, hsl(15, 85%, 65%, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, hsl(25, 90%, 70%, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, hsl(220, 26%, 4%) 0%, hsl(220, 26%, 8%) 100%)
          `
        }}
      />
      
      <div 
        className="text-center z-10 px-8"
        style={{
          opacity: textOpacity,
          transform: `scale(${textScale})`,
          transition: 'all 0.1s ease-out'
        }}
      >
        <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Interactive
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Experience AI-powered fact-checking technology that detects lies and verifies truth in real-time conversations.
        </p>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={startCapCheck}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-red-400/50 flex items-center space-x-2 shadow-lg shadow-red-500/25"
          >
            <span className="font-bold text-lg">CAP CHECK</span>
            <ChevronDown size={20} />
          </button>
          <button
            onClick={scrollToCarousel}
            className="bg-secondary/80 hover:bg-secondary text-secondary-foreground px-6 py-4 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-border flex items-center space-x-2"
          >
            <span>View Gallery</span>
            <ChevronDown size={20} />
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center animate-pulse">
          <div className="w-1 h-3 bg-primary rounded-full mt-2" 
               style={{ 
                 animation: 'bounce 6s cubic-bezier(0.4, 0, 0.6, 1) infinite'
               }} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;