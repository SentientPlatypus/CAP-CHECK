/**
 * Index Page - Main Landing Page
 * 
 * Orchestrates the complete interactive experience:
 * 1. HeroSection - Landing with parallax scroll effects and smooth navigation
 * 2. ImageCarousel - Scroll-driven horizontal carousel with zoom effects
 * 3. MessageInterface - Real-time chat simulation with dual personas
 * 4. TextReader - Auto-progressing text with synchronized highlighting
 * 
 * Each component is designed to be self-contained and performant,
 * using modern web APIs for smooth animations and interactions.
 */
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import HeroSection from '@/components/HeroSection';
import ImageCarousel from '@/components/ImageCarousel';
import { Button } from '@/components/ui/button';
import PixelButton3D from '@/components/PixelButton3D';

const Index = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [showButton, setShowButton] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const heroHeight = window.innerHeight;
      const progress = Math.min(scrollTop / heroHeight, 1);
      
      setScrollProgress(progress);
      setIsPressed(progress > 0.1);
      setShowButton(progress < 1);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* 3D Pixel Button covering 50% of landing page */}
      {showButton && (
        <div className="fixed left-0 top-0 w-1/2 h-screen z-40 flex items-center justify-center">
          <div 
            className="w-96 h-96"
            style={{
              opacity: 1 - scrollProgress * 0.3
            }}
          >
            <PixelButton3D isPressed={isPressed} scrollProgress={scrollProgress} />
          </div>
        </div>
      )}
      
      <HeroSection />
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
  );
};

export default Index;