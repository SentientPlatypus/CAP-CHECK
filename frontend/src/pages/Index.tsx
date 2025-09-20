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
import HeroSection from '@/components/HeroSection';
import ImageCarousel from '@/components/ImageCarousel';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ImageCarousel />
      
      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6 animate-slide-from-left pixelated">
            READY TO EXPERIENCE REAL-TIME COMMUNICATION?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-from-right font-mono">
            Try our AI-powered chat interface with built-in fact-checking and verification system.
          </p>
          <Link to="/chat-select">
            <Button className="hero-button animate-retro-glow">
              CHOOSE CHAT EXPERIENCE
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;