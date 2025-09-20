/**
 * Index Page - Optimized SpaceX-style Landing
 * 
 * Performance-optimized version with reduced scroll listeners
 * and simplified animations for smoother experience.
 */
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '@/components/HeroSection';
import ImageCarousel from '@/components/ImageCarousel';
import { Button } from '@/components/ui/button';

import redButton8bit from '@/assets/red-button-8bit.png';

const SECTION_HEIGHT = 1500;

const Index = () => {
  const [scrollY, setScrollY] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Optimized scroll handler with requestAnimationFrame
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);
    
    // Update background transforms directly for better performance
    if (backgroundRef.current) {
      const progress = Math.min(currentScrollY / (SECTION_HEIGHT + 500), 1);
      const size = 170 - (70 * progress); // 170% to 100%
      const opacity = Math.max(1 - (currentScrollY - SECTION_HEIGHT) / 500, 0);
      
      backgroundRef.current.style.backgroundSize = `${size}%`;
      backgroundRef.current.style.opacity = opacity.toString();
    }

    // Update overlay scale
    if (overlayRef.current) {
      const scale = 1.2 - (0.2 * Math.min(currentScrollY / (SECTION_HEIGHT + 500), 1));
      overlayRef.current.style.transform = `scale(${scale})`;
    }

    // Show overlay content when past initial section
    const progress = currentScrollY / window.innerHeight;
    setShowOverlay(progress > 0.8);
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  return (
    <div className="bg-background">
      {/* Fixed Background Hero Image */}
      <div
        ref={backgroundRef}
        className="fixed top-0 left-0 w-full h-screen z-10 pt-20"
        style={{
          backgroundImage: "url(https://images.unsplash.com/photo-1460186136353-977e9d6085a1?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "170%",
          opacity: 1,
          willChange: "transform, opacity",
        }}
      >
        {/* Overlay content on the fixed background */}
        <div
          ref={overlayRef}
          className="absolute inset-0 flex items-center"
          style={{ 
            transformOrigin: 'center',
            willChange: 'transform'
          }}
        >
          <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 items-center gap-8">
            {/* Left side - Red Button */}
            <div className="flex justify-center">
              <img 
                src={redButton8bit} 
                alt="8-bit Red Button" 
                className="w-48 h-auto object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Right side - Text */}
            <div className="text-left">
              <motion.h1
                className="font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                style={{ fontSize: 'clamp(2rem, 8vw, 5rem)' }}
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                CAP CHECK
              </motion.h1>
              <motion.p 
                className="text-lg md:text-xl text-foreground/80 max-w-xl mb-8"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              >
                Experience AI-powered fact-checking technology that detects lies and verifies truth in real-time conversations.
              </motion.p>
              <div className="flex gap-4">
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium shadow-lg transition hover:opacity-90">
                  CAP CHECK ⌄
                </button>
                <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium border border-border transition hover:opacity-90">
                  View Gallery ⌄
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content that scrolls over the fixed background */}
      <div 
        style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
        className="relative w-full"
      >
        {/* Spacer for the initial view */}
        <div className="h-screen" />
        
        {/* Simplified Static Images for Better Performance */}
        <StaticImages />
        
        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-transparent to-background z-20" />
      </div>

      {/* Regular content sections */}
      <div className="relative z-30 bg-background">
        {showOverlay && <HeroSection showOverlay={false} />}
        <ImageCarousel />
        
        {/* Call to Action Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Ready to Experience Real-time Communication?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Try our AI-powered chat interface with built-in fact-checking and verification system.
            </p>
            <Link to="/chat-select">
              <Button size="lg" className="gap-2">
                Choose Chat Experience
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

// Simplified static images with CSS-based animations for better performance
const StaticImages = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-[200px] relative z-20">
      <div className="space-y-12">
        <motion.img
          src="https://images.unsplash.com/photo-1484600899469-230e8d1d59c0?q=80&w=1000&auto=format&fit=crop"
          alt="Space technology example"
          className="w-1/3 rounded-xl shadow-2xl"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        />
        
        <motion.img
          src="https://images.unsplash.com/photo-1446776709462-d6b525c57bd3?q=80&w=1000&auto=format&fit=crop"
          alt="AI technology visualization"
          className="mx-auto w-2/3 rounded-xl shadow-2xl"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
        />
        
        <motion.img
          src="https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=1000&auto=format&fit=crop"
          alt="Digital communication"
          className="ml-auto w-1/3 rounded-xl shadow-2xl"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true, margin: "-100px" }}
        />
        
        <motion.img
          src="https://images.unsplash.com/photo-1494022299300-899b96e49893?q=80&w=1000&auto=format&fit=crop"
          alt="Interactive technology"
          className="ml-24 w-5/12 rounded-xl shadow-2xl"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        />
      </div>
    </div>
  );
};

export default Index;