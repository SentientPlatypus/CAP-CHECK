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
import ParallaxHero from '@/components/ParallaxHero';
import { Button } from '@/components/ui/button';
import ScrollPhone from '@/components/ScrollPhone';

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
      {/* Interactive Phone Animation on left side */}
      {showButton && (
        <div className="fixed left-0 top-0 w-1/2 h-screen z-40 flex items-center justify-center">
          <div 
            style={{
              opacity: 1 - scrollProgress * 0.3
            }}
          >
            <ScrollPhone scrollProgress={scrollProgress} />
          </div>
        </div>
      )}

      {/* Title Section on right half */}
      {showButton && (
        <div className="fixed right-0 top-0 w-1/2 h-screen z-40 flex items-center justify-start pl-12">
          <div 
            className="text-left"
            style={{
              opacity: 1 - scrollProgress * 0.3
            }}
          >
            <h1 className="text-8xl font-bold text-purple-500 mb-6">
              Interactive
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg mb-8">
              Experience AI-powered fact-checking technology that detects lies and verifies truth in real-time conversations.
            </p>
            <div className="flex gap-4">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium">
                CAP CHECK ⌄
              </button>
              <button className="text-muted-foreground hover:text-foreground px-6 py-3 font-medium">
                View Gallery ⌄
              </button>
            </div>
          </div>
        </div>
      )}
      
      <HeroSection showOverlay={showButton} />
      <ParallaxHero />
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