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

// Demo podcast/article content
const podcastText = [
  "Welcome to our interactive podcast experience. This is a revolutionary way to consume audio content with synchronized text highlighting.",
  "As you listen or read along, each paragraph automatically becomes highlighted, creating an immersive reading experience that's both engaging and accessible.",
  "The text automatically scrolls to keep the current paragraph in view, so you never lose your place in the content. This is perfect for long-form content consumption.",
  "Interactive elements like this demonstrate the power of modern web technologies. We can create experiences that adapt to user behavior and preferences.",
  "Whether you're following along with audio or just reading, the interface responds intelligently to keep you engaged with the content at all times.",
  "This technology can be applied to audiobooks, educational content, news articles, and any long-form text that benefits from guided reading.",
  "The smooth transitions and carefully crafted animations create a premium feel that enhances the overall user experience significantly.",
  "By combining visual feedback with content consumption, we create a more memorable and effective way to process information in the digital age."
];

const TextReader = () => {
  // Reading state management
  const [currentParagraph, setCurrentParagraph] = useState(0);  // Current active paragraph index
  const [isPlaying, setIsPlaying] = useState(false);            // Play/pause state
  const [progress, setProgress] = useState(0);                  // Progress within current paragraph (0-100)
  const [capCheckResult, setCapCheckResult] = useState<boolean | null>(null); // CAP CHECK result display
  const containerRef = useRef<HTMLDivElement>(null);            // Container for scrolling
  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]); // Individual paragraph refs

  // Auto-progression timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Only run timer when playing and not at the end
    if (isPlaying && currentParagraph < podcastText.length) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1;
          
          // When paragraph is complete (100%), move to next
          if (newProgress >= 100) {
            setCurrentParagraph(curr => {
              const next = curr + 1;
              
              // Auto-stop at the end
              if (next >= podcastText.length) {
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

  // Listen for CAP CHECK results and auto-start events
  useEffect(() => {
    const handleCapCheckResult = (event: CustomEvent) => {
      setCapCheckResult(event.detail.result);
    };

    const handleStartTextReader = () => {
      // Auto-start the text reader when triggered by CAP CHECK
      if (currentParagraph >= podcastText.length) {
        resetReader(); // Reset if already finished
      }
      setIsPlaying(true);
    };

    window.addEventListener('capCheckResult', handleCapCheckResult as EventListener);
    window.addEventListener('startTextReader', handleStartTextReader as EventListener);
    
    return () => {
      window.removeEventListener('capCheckResult', handleCapCheckResult as EventListener);
      window.removeEventListener('startTextReader', handleStartTextReader as EventListener);
    };
  }, [currentParagraph]);

  /**
   * Toggle play/pause, or restart if finished
   */
  const togglePlayback = () => {
    if (currentParagraph >= podcastText.length) {
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
    <section data-section="text-reader" className="py-20 px-8 bg-gradient-to-b from-muted to-background relative">
      <div className="max-w-4xl mx-auto">
        {/* CAP CHECK Result Display - More Apparent */}
        {capCheckResult !== null && (
          <div className="text-center mb-8 animate-fade-in">
            <div className={`inline-block px-8 py-4 rounded-2xl text-3xl md:text-4xl font-bold border-4 shadow-2xl ${
              capCheckResult 
                ? 'bg-green-500/30 text-green-300 border-green-400 shadow-green-500/50' 
                : 'bg-red-500/30 text-red-300 border-red-400 shadow-red-500/50'
            }`}>
              ANALYSIS RESULT: {capCheckResult ? 'TRUE' : 'FALSE'}
            </div>
            {!capCheckResult && (
              <div className="mt-4 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-300">
                <p className="text-lg font-semibold">⚠️ DECEPTION DETECTED</p>
                <p className="text-sm text-red-400 mt-1">Statement flagged as potentially false or misleading</p>
              </div>
            )}
          </div>
        )}

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Interactive Text Reader
          </h2>
          <p className="text-muted-foreground">
            Follow along as the text highlights and scrolls automatically
          </p>
        </div>

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
              {currentParagraph + 1} / {podcastText.length}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-8 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-100 ease-out"
              style={{ 
                width: `${(currentParagraph * 100 + progress) / podcastText.length}%` 
              }}
            />
          </div>

          {/* Text content */}
          <div 
            ref={containerRef}
            className="max-h-96 overflow-y-auto space-y-6 text-lg leading-relaxed scrollbar-thin scrollbar-thumb-primary/20"
          >
            {podcastText.map((paragraph, index) => (
              <p
                key={index}
                ref={el => paragraphRefs.current[index] = el}
                className={getParagraphClass(index)}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {currentParagraph >= podcastText.length && (
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