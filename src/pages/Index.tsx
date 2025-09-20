/**
 * Index Page - Performance Optimized Landing
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroSection from '@/components/HeroSection';
import ImageCarousel from '@/components/ImageCarousel';
import { Button } from '@/components/ui/button';

import redButton8bit from '@/assets/red-button-8bit.png';

const Index = () => {
  return (
    <div className="bg-background">
      {/* Static Background Hero */}
      <div className="relative w-full h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1460186136353-977e9d6085a1?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)"
          }}
        />
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 items-center gap-8">
            {/* Left side - Red Button */}
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <img 
                src={redButton8bit} 
                alt="8-bit Red Button" 
                className="w-48 h-auto object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </motion.div>

            {/* Right side - Text */}
            <div className="text-left">
              <motion.h1
                className="font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                style={{ 
                  fontSize: 'clamp(2rem, 8vw, 5rem)',
                  opacity: 1,
                  transform: 'translateX(0px)'
                }}
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                CAP CHECK
              </motion.h1>
              <motion.p 
                className="text-lg md:text-xl text-foreground/80 max-w-xl mb-8"
                style={{
                  opacity: 1,
                  transform: 'translateX(0px)'
                }}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              >
                Experience AI-powered fact-checking technology that detects lies and verifies truth in real-time conversations.
              </motion.p>
              <motion.div 
                className="flex gap-4"
                style={{
                  opacity: 1,
                  transform: 'translateY(0px)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium shadow-lg transition hover:opacity-90">
                  CAP CHECK ⌄
                </button>
                <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium border border-border transition hover:opacity-90">
                  View Gallery ⌄
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div className="relative bg-background">
        <HeroSection showOverlay={false} />
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

export default Index;