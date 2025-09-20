/**
 * MessageInterface Component
 * 
 * AI content verification and reading system
 */
import { useState, useEffect } from 'react';
import { chatActions } from '@/lib/globalState';

// Demo content for AI reading
const aiContent = "Welcome to our AI-powered content verification system. This technology analyzes statements in real-time to determine their accuracy.";

const MessageInterface = () => {
  // AI Reader state
  const [capCheckResult, setCapCheckResult] = useState<boolean | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [aiVerificationStatus, setAiVerificationStatus] = useState<boolean>(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState<string>(aiContent);

  // Fetch AI verification status on mount
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      const status = await chatActions.fetchAiVerificationStatus();
      setAiVerificationStatus(status);
    };
    
    fetchVerificationStatus();
  }, []);

  // Monitor for CAP CHECK results and AI message events
  useEffect(() => {
    const handleCapCheckResult = (event: CustomEvent) => {
      setCapCheckResult(event.detail.result);
    };

    const handleStartTextReader = () => {
      speakText(aiGeneratedContent);
    };

    const handleAddAiMessage = (event: CustomEvent) => {
      setAiGeneratedContent(event.detail.message);
    };

    window.addEventListener('capCheckResult', handleCapCheckResult as EventListener);
    window.addEventListener('startTextReader', handleStartTextReader as EventListener);
    window.addEventListener('addAiMessage', handleAddAiMessage as EventListener);
    
    return () => {
      window.removeEventListener('capCheckResult', handleCapCheckResult as EventListener);
      window.removeEventListener('startTextReader', handleStartTextReader as EventListener);
      window.removeEventListener('addAiMessage', handleAddAiMessage as EventListener);
    };
  }, [aiGeneratedContent]);

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

  return (
    <section className="py-20 px-8 bg-gradient-to-b from-card to-muted min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* AI Feedback at Top */}
        {capCheckResult !== null && (
          <div className="animate-fade-in text-center">
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

        {/* AI Content Reader */}
        <div className="bg-background/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-border">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Content Verification System
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Real-time AI analysis and content verification with speech synthesis
            </p>
          </div>

          {/* AI Content Display */}
          <div className="w-full">
            <div className="w-full p-6 rounded-lg bg-card/50 border border-border/50">
              <div className="text-center mb-4">
                <span className={`text-lg font-bold ${
                  aiVerificationStatus 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  VERIFIED {aiVerificationStatus ? 'TRUE' : 'FALSE'}
                </span>
              </div>
              <p className={`text-base leading-relaxed transition-all duration-300 text-center ${
                isSpeaking ? 'opacity-100' : 'opacity-100'
              }`}>
                {aiGeneratedContent.split(' ').map((word, wordIdx) => {
                  const isCurrentWord = isSpeaking && wordIdx === currentWordIndex;
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
          </div>
        </div>
      </div>
    </section>
  );
};
export default MessageInterface;