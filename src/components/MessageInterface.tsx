/**
 * MessageInterface Component
 * 
 * Unified AI content reader with text highlighting
 */
import { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { chatGlobals } from '@/lib/globalState';

// Demo content for AI reading
const aiContent = [
  "Welcome to our AI-powered content verification system. This technology analyzes statements in real-time to determine their accuracy.",
  "Using advanced language models and fact-checking algorithms, we can identify potentially misleading or false information as it's presented.",
  "The system provides immediate feedback, highlighting verified facts in green and flagging suspicious claims in red for further review.",
  "This technology represents a significant step forward in combating misinformation and promoting accurate information sharing.",
  "By combining artificial intelligence with human oversight, we create a more trustworthy information ecosystem for everyone.",
  "The real-time analysis happens instantly, allowing for immediate corrections and clarifications when needed.",
  "This system can be applied to news articles, social media posts, educational content, and any form of digital communication.",
  "The goal is to empower users with accurate information and help them make informed decisions based on verified facts."
];

const MessageInterface = () => {
  // State management
  const [capCheckResult, setCapCheckResult] = useState<boolean | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Check for API key on mount
  useEffect(() => {
    const apiKey = localStorage.getItem('ELEVENLABS_API_KEY');
    setHasApiKey(!!apiKey);
  }, []);

  // Monitor for CAP CHECK results
  useEffect(() => {
    const handleCapCheckResult = (event: CustomEvent) => {
      setCapCheckResult(event.detail.result);
    };

    const handleStartTextReader = () => {
      speakText(aiContent.join(' '));
    };

    window.addEventListener('capCheckResult', handleCapCheckResult as EventListener);
    window.addEventListener('startTextReader', handleStartTextReader as EventListener);
    
    return () => {
      window.removeEventListener('capCheckResult', handleCapCheckResult as EventListener);
      window.removeEventListener('startTextReader', handleStartTextReader as EventListener);
    };
  }, []);

  // Simulate text-to-speech with highlighting
  const speakText = async (text: string) => {
    setIsSpeaking(true);
    const words = text.split(' ');
    
    // Simulate reading at ~150 words per minute
    const wordsPerMinute = 150;
    const intervalMs = (60 * 1000) / wordsPerMinute;
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      setCurrentWordIndex(i);
    }
    
    setIsSpeaking(false);
    setCurrentWordIndex(0);
  };

  const setApiKey = () => {
    const key = prompt('Enter your ElevenLabs API Key:');
    if (key) {
      localStorage.setItem('ELEVENLABS_API_KEY', key);
      setHasApiKey(true);
    }
  };

  return (
    <section className="py-20 px-8 bg-gradient-to-b from-card to-muted min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* AI Feedback at Top */}
        {capCheckResult !== null && (
          <div className="mb-8 animate-fade-in text-center">
            <div className={`inline-block px-8 py-6 rounded-2xl text-4xl md:text-5xl font-bold border-4 shadow-2xl ${
              capCheckResult 
                ? 'bg-green-500/30 text-green-300 border-green-400 shadow-green-500/50' 
                : 'bg-red-500/30 text-red-300 border-red-400 shadow-red-500/50'
            }`}>
              AI: {capCheckResult ? 'TRUE' : 'FALSE'}
            </div>
            {!capCheckResult && (
              <div className="mt-4 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-300 max-w-md mx-auto">
                <p className="text-lg font-semibold">⚠️ DECEPTION DETECTED</p>
                <p className="text-sm text-red-400 mt-1">Statement flagged as potentially false or misleading</p>
              </div>
            )}
          </div>
        )}

        {/* Single Unified Content Section */}
        <div className="bg-background/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-border">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Content Reader
            </h2>
            <p className="text-muted-foreground mb-6">
              AI content with synchronized text highlighting {hasApiKey ? 'and voice reading' : '(set API key for voice)'}
            </p>
            
            {/* TTS Controls */}
            <div className="flex justify-center items-center space-x-4 mb-8">
              <button
                onClick={() => speakText(aiContent.join(' '))}
                disabled={isSpeaking}
                className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                <Volume2 size={20} />
                <span>{isSpeaking ? 'Reading...' : hasApiKey ? 'Start Reading' : 'Demo Reading'}</span>
              </button>
              {!hasApiKey && (
                <button
                  onClick={setApiKey}
                  className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-all"
                >
                  Set API Key
                </button>
              )}
            </div>
          </div>

          {/* Content with Word-by-Word Highlighting */}
          <div className="space-y-6">
            {aiContent.map((paragraph, paragraphIndex) => {
              const words = paragraph.split(' ');
              const paragraphStartIndex = aiContent.slice(0, paragraphIndex)
                .reduce((acc, p) => acc + p.split(' ').length, 0);
              
              return (
                <div
                  key={paragraphIndex}
                  className={`p-6 rounded-xl border transition-all duration-500 ${
                    isSpeaking && currentWordIndex >= paragraphStartIndex && 
                    currentWordIndex < paragraphStartIndex + words.length
                      ? 'bg-primary/10 border-primary/30 shadow-lg scale-[1.01]'
                      : 'bg-card/50 border-border/50'
                  }`}
                >
                  <p className="text-lg leading-relaxed">
                    {words.map((word, wordIdx) => {
                      const globalWordIndex = paragraphStartIndex + wordIdx;
                      const isCurrentWord = isSpeaking && globalWordIndex === currentWordIndex;
                      
                      return (
                        <span
                          key={wordIdx}
                          className={`transition-all duration-200 ${
                            isCurrentWord 
                              ? 'bg-primary text-primary-foreground px-1 rounded shadow-lg transform scale-105' 
                              : ''
                          }`}
                        >
                          {word}{' '}
                        </span>
                      );
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MessageInterface;