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
  const [showButton, setShowButton] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const heroHeight = window.innerHeight; // Assuming hero section is viewport height
      const progress = Math.min(scrollTop / heroHeight, 1);
      
      setScrollProgress(progress);
      setIsPressed(progress > 0.2); // Button gets "pressed" after 20% scroll
      setShowButton(progress < 1); // Hide when scrolled past landing page
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Large Red Button on Left Side */}
      {showButton && (
        <div className="fixed left-8 top-1/2 transform -translate-y-1/2 z-50">
          <div 
            className={`transition-all duration-300 ${
              isPressed ? 'scale-90 brightness-75' : 'scale-100'
            }`}
            style={{
              filter: isPressed ? 'brightness(0.7) contrast(1.3)' : 'none',
              opacity: 1 - scrollProgress * 0.5 // Fade out as we scroll
            }}
          >
            <img 
              src={redButtonImage} 
              alt="Red Button" 
              className="w-32 h-32 pixelated"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <div className="text-sm text-center mt-2 text-muted-foreground">
            {isPressed ? 'PRESSED!' : 'Scroll down...'}
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