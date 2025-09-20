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
import redButtonImage from '@/assets/red-button.png';

const Index = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTop / docHeight;
      setScrollProgress(progress);
      setIsPressed(progress > 0.3); // Button gets "pressed" after 30% scroll
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Scroll-triggered Red Button */}
      <div className="fixed top-8 right-8 z-50">
        <div 
          className={`transition-transform duration-200 ${
            isPressed ? 'scale-95 brightness-75' : 'scale-100'
          }`}
          style={{
            filter: isPressed ? 'brightness(0.8) contrast(1.2)' : 'none'
          }}
        >
          <img 
            src={redButtonImage} 
            alt="Red Button" 
            className="w-16 h-16 pixelated"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
        <div className="text-xs text-center mt-2 text-muted-foreground">
          Scroll: {Math.round(scrollProgress * 100)}%
        </div>
      </div>
      
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