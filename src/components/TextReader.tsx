import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

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
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentParagraph < podcastText.length) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1;
          if (newProgress >= 100) {
            setCurrentParagraph(curr => {
              const next = curr + 1;
              if (next >= podcastText.length) {
                setIsPlaying(false);
                return curr;
              }
              return next;
            });
            return 0;
          }
          return newProgress;
        });
      }, 50); // 5 seconds per paragraph (100 * 50ms)
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentParagraph]);

  useEffect(() => {
    // Scroll current paragraph into view
    if (paragraphRefs.current[currentParagraph]) {
      paragraphRefs.current[currentParagraph]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentParagraph]);

  const togglePlayback = () => {
    if (currentParagraph >= podcastText.length) {
      resetReader();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const resetReader = () => {
    setCurrentParagraph(0);
    setProgress(0);
    setIsPlaying(false);
  };

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
    <section className="py-20 px-8 bg-gradient-to-b from-muted to-background">
      <div className="max-w-4xl mx-auto">
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