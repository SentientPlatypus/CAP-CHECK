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
import HeroSection from '@/components/HeroSection';
import ImageCarousel from '@/components/ImageCarousel';
import MessageInterface from '@/components/MessageInterface';
import TextReader from '@/components/TextReader';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ImageCarousel />
      <MessageInterface />
    </div>
  );
};

export default Index;