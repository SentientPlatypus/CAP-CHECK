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
import DebateSection from '@/components/DebateSection';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ImageCarousel />
      <DebateSection />
      
      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6 animate-slide-from-left font-pixel text-white" 
              style={{ 
                textShadow: '4px 4px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
                imageRendering: 'pixelated'
              }}>
            READY TO EXPERIENCE REAL-TIME COMMUNICATION?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto animate-slide-from-right font-pixel text-white bg-black/60 px-6 py-3 rounded-xl border border-primary/30"
             style={{ imageRendering: 'pixelated' }}>
            Try our AI-powered chat interface with built-in fact-checking and verification system.
          </p>
          <Link to="/chat-select">
            <Button className="hero-button animate-retro-glow font-pixel" 
                    style={{ imageRendering: 'pixelated' }}>
              CHOOSE CHAT EXPERIENCE
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-primary/20 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 mb-4 md:mb-0">
            <span className="font-pixel text-white/70 text-sm" style={{ imageRendering: "pixelated" }}>
              Made by
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
              <a 
                href="mailto:gjw62@cornell.edu" 
                className="font-pixel text-primary hover:text-primary/80 transition-colors duration-300"
                style={{ imageRendering: "pixelated" }}
              >
                Geneustace Wicaksono
              </a>
              <span className="text-white/50">•</span>
              <a 
                href="mailto:nj277@cornell.edu" 
                className="font-pixel text-primary hover:text-primary/80 transition-colors duration-300"
                style={{ imageRendering: "pixelated" }}
              >
                Naijei Jiang
              </a>
              <span className="text-white/50">•</span>
              <a 
                href="mailto:gl537@cornell.edu" 
                className="font-pixel text-primary hover:text-primary/80 transition-colors duration-300"
                style={{ imageRendering: "pixelated" }}
              >
                Grant Lin
              </a>
              <span className="text-white/50">•</span>
              <a 
                href="mailto:zs434@cornell.edu" 
                className="font-pixel text-primary hover:text-primary/80 transition-colors duration-300"
                style={{ imageRendering: "pixelated" }}
              >
                Zenchang Sun
              </a>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <a 
              href="https://github.com/placeholder/repository" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-pixel text-white/70 hover:text-primary transition-colors duration-300 flex items-center space-x-2 hover-scale"
              style={{ imageRendering: "pixelated" }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;