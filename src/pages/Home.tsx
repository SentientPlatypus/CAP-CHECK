/**
 * Home Page - Landing Page
 * 
 * Beautiful landing page with hero section, image carousel, and navigation to chat
 */
import { Link } from 'react-router-dom';
import HeroSection from '@/components/HeroSection';
import ImageCarousel from '@/components/ImageCarousel';
import { ArrowRight, MessageCircle } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Floating background orbs */}
      <div className="floating-orb w-96 h-96 top-20 -left-48 animate-float" style={{ animationDelay: '0s' }} />
      <div className="floating-orb w-64 h-64 top-1/2 -right-32 animate-float" style={{ animationDelay: '2s' }} />
      <div className="floating-orb w-80 h-80 bottom-20 left-1/4 animate-float" style={{ animationDelay: '4s' }} />
      
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted/50" />
      
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="glass-card px-8 py-4 rounded-2xl">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Chat
            </Link>
            <Link 
              to="/chat" 
              className="premium-button flex items-center space-x-2 hover:scale-105 transition-all duration-300"
            >
              <MessageCircle size={20} />
              <span>Start Chat</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10">
        <HeroSection />
        <ImageCarousel />
        
        {/* Call to Action Section */}
        <section className="py-20 px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-card p-12 rounded-3xl">
              <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Ready to Experience AI-Powered Chat?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Enter our real-time communication interface where every message is analyzed for truthfulness by advanced AI systems.
              </p>
              <Link 
                to="/chat"
                className="premium-button text-xl px-12 py-6 inline-flex items-center space-x-3 hover:scale-110 transition-all duration-300"
              >
                <MessageCircle size={24} />
                <span>Launch Chat Interface</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;