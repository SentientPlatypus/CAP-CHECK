import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToCarousel = () => {
    const carouselSection = document.querySelector('[data-section="carousel"]') as HTMLElement | null;
    if (!carouselSection) return;

    const startY = window.pageYOffset;
    const targetY = window.pageYOffset + carouselSection.getBoundingClientRect().top;
    const duration = 2200; // slower smooth scroll (ms)
    const startTime = performance.now();

    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, startY + (targetY - startY) * eased);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const textOpacity = Math.max(0, 1 - scrollY / 300);
  const textScale = Math.max(0.5, 1 - scrollY / 600);

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
          Experience the future of web interaction with scroll-based animations, immersive carousels, and real-time communication.
        </p>
        
        <div className="flex justify-center">
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