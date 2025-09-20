/**
 * TextReader Component
 * 
 * Interactive text reader with auto-progression and highlighting:
 * - Simulates podcast/audiobook experience with synchronized text
 * - Auto-scrolling keeps current paragraph centered in view
 * - Progress tracking with visual progress bar
 * - Play/pause/reset controls with smooth transitions
 * - Dynamic text styling based on reading position
 * 
 * Reading mechanics:
 * - 5 seconds per paragraph (100 steps × 50ms intervals)
 * - Smooth scroll animation to keep text in view
 * - Color transitions: active (full), read (dimmed), unread (faded)
 * - Auto-stop at end with completion message
 */
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

// CAP CHECK explanation content
const capCheckText = [
  "Welcome to CAP CHECK - the revolutionary AI-powered lie detection system that analyzes speech patterns, micro-expressions, and contextual data in real-time.",
  "Our advanced algorithms process thousands of data points per second, cross-referencing statements against verified databases and detecting inconsistencies in vocal stress patterns.",
  "The system uses machine learning models trained on millions of verified true and false statements to identify deceptive language patterns with 94.7% accuracy.",
  "CAP CHECK integrates seamlessly into any communication platform, providing instant verification badges that appear within seconds of statement analysis.",
  "Whether you're verifying debtor claims, checking witness testimonies, or ensuring accuracy in business negotiations, CAP CHECK provides reliable truth verification.",
  "The technology combines natural language processing, behavioral analysis, and real-time fact-checking to create the most comprehensive lie detection system available.",
  "Our proprietary neural networks can detect subtle changes in speech rhythm, word choice patterns, and emotional markers that indicate potential deception.",
  "CAP CHECK is already being used by major corporations, legal firms, and financial institutions to ensure truthfulness in critical communications and reduce fraud by up to 73%."
];

const TextReader = () => {
  // Reading state management
  const [currentParagraph, setCurrentParagraph] = useState(0);  // Current active paragraph index
  const [isPlaying, setIsPlaying] = useState(false);            // Play/pause state
  const [progress, setProgress] = useState(0);                  // Progress within current paragraph (0-100)
  const [showFlashing, setShowFlashing] = useState(false);      // Show flashing True/False display
  const [flashingValue, setFlashingValue] = useState<boolean | null>(null); // Current flashing value
  const [capCheckMode, setCapCheckMode] = useState(false);      // CAP CHECK mode active
  const containerRef = useRef<HTMLDivElement>(null);            // Container for scrolling
  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]); // Individual paragraph refs

  // Auto-progression timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Only run timer when playing and not at the end
    if (isPlaying && currentParagraph < capCheckText.length) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1;
          
          // When paragraph is complete (100%), move to next
          if (newProgress >= 100) {
            setCurrentParagraph(curr => {
              const next = curr + 1;
              
              // Auto-stop at the end
              if (next >= capCheckText.length) {
                setIsPlaying(false);
                return curr;
              }
              return next;
            });
            return 0; // Reset progress for next paragraph
          }
          return newProgress;
        });
      }, 50); // 50ms intervals = 5 seconds per paragraph (100 × 50ms)
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentParagraph]);

  // Auto-scroll current paragraph to center of view
  useEffect(() => {
    if (paragraphRefs.current[currentParagraph]) {
      paragraphRefs.current[currentParagraph]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'  // Keep current paragraph centered
      });
    }
  }, [currentParagraph]);

  // Listen for CAP CHECK activation
  useEffect(() => {
    const handleCapCheck = () => {
      setCapCheckMode(true);
      setShowFlashing(true);
      
      // Flash True/False for 3 seconds
      let flashCount = 0;
      const flashInterval = setInterval(() => {
        setFlashingValue(prev => !prev);
        flashCount++;
        
        if (flashCount >= 6) { // 3 seconds of flashing
          clearInterval(flashInterval);
          setShowFlashing(false);
          setFlashingValue(Math.random() > 0.5); // Final random result
          
          // Start reading after flash
          setTimeout(() => {
            setIsPlaying(true);
          }, 500);
        }
      }, 500);
    };

    window.addEventListener('startCapCheck', handleCapCheck);
    return () => window.removeEventListener('startCapCheck', handleCapCheck);
  }, []);

  /**
   * Toggle play/pause, or restart if finished
   */
  const togglePlayback = () => {
    if (currentParagraph >= capCheckText.length) {
      resetReader();  // Restart from beginning if finished
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  /**
   * Reset reader to initial state
   */
  const resetReader = () => {
    setCurrentParagraph(0);
    setProgress(0);
    setIsPlaying(false);
    setCapCheckMode(false);
    setShowFlashing(false);
    setFlashingValue(null);
  };

  /**
   * Dynamic styling based on paragraph position relative to current
   * - Current: Full opacity and highlight color
   * - Past: Dimmed but still readable
   * - Future: Very faded to show what's coming
   */
  const getParagraphClass = (index: number) => {
    if (index === currentParagraph) {
      return 'text-foreground text-highlight transition-all duration-500';
    } else if (index < currentParagraph) {
      return 'text-muted-foreground opacity-60 transition-all duration-500';
    } else {
      return 'text-muted-foreground opacity-40 transition-all duration-500';
    }
  };

  return (
    <section data-section="text-reader" className="py-20 px-8 bg-gradient-to-b from-muted to-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          {capCheckMode && (
            <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              CAP CHECK
            </h1>
          )}
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {capCheckMode ? 'AI Lie Detection System' : 'Interactive Text Reader'}
          </h2>
          <p className="text-muted-foreground">
            {capCheckMode ? 'Real-time truth verification and deception analysis' : 'Follow along as the text highlights and scrolls automatically'}
          </p>
        </div>

        {/* Flashing True/False Display */}
        {(showFlashing || flashingValue !== null) && (
          <div className="text-center mb-8">
            <div className={`inline-block px-8 py-4 rounded-xl text-4xl font-bold border-4 transition-all duration-300 ${
              showFlashing 
                ? (flashingValue ? 'bg-green-500/20 text-green-400 border-green-500 animate-pulse' : 'bg-red-500/20 text-red-400 border-red-500 animate-pulse')
                : (flashingValue ? 'bg-green-500/20 text-green-400 border-green-500' : 'bg-red-500/20 text-red-400 border-red-500')
            }`}>
              {flashingValue ? 'TRUE' : 'FALSE'}
            </div>
          </div>
        )}

        <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border">
          {/* Controls */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <button
              onClick={togglePlayback}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-4 rounded-full transition-all duration-200 hover:scale-105 shadow-lg"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              onClick={resetReader}
              className="bg-secondary text-secondary-foreground p-4 rounded-full transition-all duration-200 hover:scale-105 hover:bg-secondary/80"
            >
              <RotateCcw size={24} />
            </button>
            <div className="text-sm text-muted-foreground">
              {currentParagraph + 1} / {capCheckText.length}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-8 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-100 ease-out"
              style={{ 
                width: `${(currentParagraph * 100 + progress) / capCheckText.length}%` 
              }}
            />
          </div>

          {/* Text content */}
          <div 
            ref={containerRef}
            className="max-h-96 overflow-y-auto space-y-6 text-lg leading-relaxed scrollbar-thin scrollbar-thumb-primary/20"
          >
            {capCheckText.map((paragraph, index) => (
              <p
                key={index}
                ref={el => paragraphRefs.current[index] = el}
                className={getParagraphClass(index)}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {currentParagraph >= capCheckText.length && (
            <div className="text-center mt-8 p-6 bg-primary/10 rounded-xl border border-primary/20">
              <p className="text-primary font-semibold mb-2">Reading Complete!</p>
              <p className="text-muted-foreground text-sm">
                Click the reset button to start over or the play button to replay.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TextReader;