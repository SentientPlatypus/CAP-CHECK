/**
 * HeroSection Component
 * 
 * Landing page hero with interactive scroll effects:
 * - Parallax text fade and scale based on scroll position
 * - Smooth scroll animation to carousel section using cubic easing
 * - CAP CHECK modal functionality for lie detection demo
 * - Integration with MessageInterface through global state
 * - Gradient background with radial overlays for visual depth
 * - Animated scroll indicator with pulsing effects
 * 
 * Performance optimizations:
 * - Uses requestAnimationFrame for smooth scroll animations
 * - Minimal re-renders with direct style manipulation
 * - Passive scroll listener for better performance
 */
import { useEffect, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { chatActions } from '@/lib/globalState';

const HeroSection = () => {
  // Track scroll position for parallax effects
  const [scrollY, setScrollY] = useState(0);
  // CAP CHECK modal state
  const [showModal, setShowModal] = useState(false);
  const [showFlashing, setShowFlashing] = useState(false);
  const [flashingValue, setFlashingValue] = useState<boolean | null>(null);
  const [finalResult, setFinalResult] = useState<boolean | null>(null);
  // Track if CAP CHECK has been used before
  const [hasUsedCapCheck, setHasUsedCapCheck] = useState(false);

  // Set up scroll listener for parallax effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Smooth scroll to carousel section using custom easing
   * Uses requestAnimationFrame for 60fps smooth animation
   */
  const scrollToCarousel = () => {
    const carouselSection = document.querySelector('[data-section="carousel"]') as HTMLElement | null;
    if (!carouselSection) return;

    performSmoothScroll(carouselSection);
  };

  /**
   * CAP CHECK - Show modal with faster True/False flashing, send to chat, then start text reader
   * Always add new AI block after the newest message when pressed
   */
  const startCapCheck = () => {
    // Send last user message to backend
    chatActions.sendLastMessageToBackend();
    
    // Always add AI block after newest message when CAP CHECK is pressed
    const aiPrompt = "Welcome to our AI-powered content verification system. This technology analyzes statements in real-time to determine their accuracy.";
    
    // Add AI prompt as a center message after the newest message
    setTimeout(() => {
      // Dispatch custom event to add AI content message
      window.dispatchEvent(new CustomEvent('addAiMessage', { 
        detail: { message: aiPrompt } 
      }));
    }, 200);
    
    // If first time, also run the modal flow
    if (!hasUsedCapCheck) {
      setHasUsedCapCheck(true);
      
      // Send "CAP CHECK" message to chat interface
      chatActions.setPersonOneInput('CAP CHECK');
      
      setShowModal(true);
      setShowFlashing(true);
      setFlashingValue(true);
      
      // Faster flashing between True/False (every 300ms)
      let fadeCount = 0;
      const fadeInterval = setInterval(() => {
        setFlashingValue(prev => !prev);
        fadeCount++;
        
        if (fadeCount >= 6) { // 2 seconds of flashing (6 * 300ms = 1.8s)
          clearInterval(fadeInterval);
          const result = Math.random() > 0.3; // 70% chance of FALSE for more apparent display
          setFlashingValue(result);
          setFinalResult(result);
          
          // Send result to chat interface and text reader
          setTimeout(() => {
            const resultText = result ? 'VERIFIED TRUE' : 'FLAGGED FALSE';
            chatActions.setPersonTwoInput(resultText);
            chatActions.setTruthVerification(result);
            
            // Send result to text reader
            window.dispatchEvent(new CustomEvent('capCheckResult', { 
              detail: { result } 
            }));
            
            // Trigger text reader to auto-start
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('startTextReader'));
            }, 1000);
          }, 500);
          
          // Hide modal after showing final result for 1.5 seconds
          setTimeout(() => {
            setShowModal(false);
            setShowFlashing(false);
            
            // Jump to text reader after modal closes (instant, no smooth scroll)
            setTimeout(() => {
              const textReaderSection = document.querySelector('[data-section="text-reader"]') as HTMLElement | null;
              if (textReaderSection) {
                textReaderSection.scrollIntoView({ behavior: 'auto', block: 'start' });
              }
            }, 300); // Small delay to ensure modal is fully closed
          }, 1500);
        }
      }, 300); // Faster fade transition
    }
  };

  /**
   * Reusable smooth scroll function
   */
  const performSmoothScroll = (targetElement: HTMLElement) => {

    const startY = window.pageYOffset;
    const targetY = window.pageYOffset + targetElement.getBoundingClientRect().top;
    const duration = 1200; // Animation duration in milliseconds
    const startTime = performance.now();

    // Cubic easing for smooth acceleration/deceleration
    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    // Animation step function - called each frame
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, startY + (targetY - startY) * eased);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  // Parallax calculations: fade out and scale down as user scrolls
  const textOpacity = Math.max(0, 1 - scrollY / 300);  // Fade out over 300px
  const textScale = Math.max(0.5, 1 - scrollY / 600);  // Scale down to 50% over 600px

  return (
    <>
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-background via-card to-background"
          style={{
            background: `
              radial-gradient(circle at 30% 40%, hsl(15, 85%, 65%, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 60%, hsl(25, 90%, 70%, 0.1) 0%, transparent 50%),
              linear-gradient(135deg, hsl(220, 26%, 4%) 0%, hsl(220, 26%, 8%) 100%)
            `
          }}
        />
        
        <div 
          className="text-center z-10 px-8"
          style={{
            opacity: textOpacity,
            transform: `scale(${textScale})`,
            transition: 'all 0.1s ease-out'
          }}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Interactive
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Experience AI-powered fact-checking technology that detects lies and verifies truth in real-time conversations.
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={startCapCheck}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-red-400/50 flex items-center space-x-2 shadow-lg shadow-red-500/25"
            >
              <span className="font-bold text-lg">CAP CHECK</span>
              <ChevronDown size={20} />
            </button>
            <button
              onClick={scrollToCarousel}
              className="bg-secondary/80 hover:bg-secondary text-secondary-foreground px-6 py-4 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-border flex items-center space-x-2"
            >
              <span>View Gallery</span>
              <ChevronDown size={20} />
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center animate-pulse">
            <div className="w-1 h-3 bg-primary rounded-full mt-2" 
                 style={{ 
                   animation: 'bounce 6s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                 }} />
          </div>
        </div>
      </section>

      {/* Floating Truth Badge - shows after CAP CHECK completes */}
      {finalResult !== null && !showModal && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className={`px-4 py-2 rounded-full border-2 font-bold text-lg shadow-lg ${
            finalResult 
              ? 'bg-green-500/20 text-green-400 border-green-500 shadow-green-500/25' 
              : 'bg-red-500/20 text-red-400 border-red-500 shadow-red-500/25'
          }`}>
            {finalResult ? 'TRUE' : 'FALSE'}
          </div>
        </div>
      )}

      {/* CAP CHECK Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-background/95 backdrop-blur-md rounded-2xl p-12 border border-border shadow-2xl max-w-md w-full mx-4 animate-scale-in">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                CAP CHECK
              </h1>
              
              <div className="mb-8">
                <div className={`inline-block px-12 py-6 rounded-2xl text-6xl font-bold border-4 transition-all duration-200 ease-in-out ${
                  flashingValue ? 'bg-green-500/20 text-green-400 border-green-500' : 'bg-red-500/20 text-red-400 border-red-500'
                }`}>
                  {flashingValue ? 'TRUE' : 'FALSE'}
                </div>
              </div>
              
              <p className="text-muted-foreground text-lg">
                AI Analysis in Progress...
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroSection;