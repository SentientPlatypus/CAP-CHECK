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
import { DataExportPanel } from '@/components/DataExportPanel';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ImageCarousel />
      <MessageInterface />
      
      {/* Data Export Section */}
      <section className="py-12 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Data Management</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Export and manage global variables for external integrations like Flask and SQLite.
            </p>
          </div>
          <div className="flex justify-center">
            <DataExportPanel />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;