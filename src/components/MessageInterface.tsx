/**
 * MessageInterface Component
 * 
 * Interactive chat with AI feedback and text highlighting
 */
import { useState, useEffect, useRef } from 'react';
import { Send, Shield, AlertTriangle, Clock, Volume2 } from 'lucide-react';
import { chatGlobals, chatActions, truthUtils } from '@/lib/globalState';

// Message data structure
interface Message {
  id: string;
  text: string;
  sender: 'left' | 'right' | 'center';
  timestamp: Date;
  truthVerification?: boolean | null;
}

// Demo content for AI reading
const aiContent = [
  "Welcome to our AI-powered content verification system. This technology analyzes statements in real-time to determine their accuracy."
];

// AI verification display status (for now always FALSE)
const aiContentVerificationStatus = false;

const MessageInterface = () => {
  // Chat state management
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hey! How are you doing?', sender: 'left', timestamp: new Date() },
    { id: '2', text: 'I\'m great! Just checking out this amazing interface.', sender: 'right', timestamp: new Date() },
    { id: 'ai-content', text: aiContent.join(' '), sender: 'center', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSender, setCurrentSender] = useState<'left' | 'right'>('right');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI Reader state
  const [capCheckResult, setCapCheckResult] = useState<boolean | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isStatusSticky, setIsStatusSticky] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  // AI Verification Status
  const [aiVerificationStatus, setAiVerificationStatus] = useState<boolean>(false);
  
  // Modal state for CAP CHECK
  const [showModal, setShowModal] = useState(false);
  const [flashingValue, setFlashingValue] = useState(true);
  const [finalResult, setFinalResult] = useState<boolean | null>(null);

  // Check for API key and fetch AI verification status on mount
  useEffect(() => {
    const apiKey = localStorage.getItem('ELEVENLABS_API_KEY');
    setHasApiKey(!!apiKey);
    
    // Fetch AI verification status from backend
    const fetchVerificationStatus = async () => {
      const status = await chatActions.fetchAiVerificationStatus();
      setAiVerificationStatus(status?.verified || false);
    };
    
    fetchVerificationStatus();
  }, []);

  // Scroll listener for sticky AI status
  useEffect(() => {
    const handleScroll = () => {
      if (statusRef.current && capCheckResult !== null) {
        const statusRect = statusRef.current.getBoundingClientRect();
        const isScrolledPast = statusRect.top < 0;
        setIsStatusSticky(isScrolledPast);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [capCheckResult]);

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Monitor global variables for Person A and B inputs
  useEffect(() => {
    const checkGlobalInputs = () => {
      // Check Person A input
      if (chatGlobals.personOneInput.trim()) {
        const newMessage: Message = {
          id: Date.now().toString(),
          text: chatGlobals.personOneInput.trim(),
          sender: 'left',
          timestamp: new Date(),
          truthVerification: chatGlobals.truthVerification
        };
        setMessages(prev => [...prev, newMessage]);
        chatActions.setPersonOneInput('');
        chatActions.setTruthVerification(null);
      }
      
      // Check Person B input
      if (chatGlobals.personTwoInput.trim()) {
        const newMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: chatGlobals.personTwoInput.trim(),
          sender: 'right',
          timestamp: new Date(),
          truthVerification: chatGlobals.truthVerification
        };
        setMessages(prev => [...prev, newMessage]);
        chatActions.setPersonTwoInput('');
        chatActions.setTruthVerification(null);
      }
    };

    const interval = setInterval(checkGlobalInputs, 100);
    return () => clearInterval(interval);
  }, []);

  // Monitor for CAP CHECK results and AI message events
  useEffect(() => {
    const handleCapCheckResult = (event: CustomEvent) => {
      setCapCheckResult(event.detail.result);
    };

    const handleCapCheckStart = () => {
      // Use the handleCapCheck function
      handleCapCheck();
    };

    const handleStartTextReader = () => {
      // Find the newest AI message (last center message) and speak it
      const centerMessages = messages.filter(m => m.sender === 'center');
      const newestAiMessage = centerMessages[centerMessages.length - 1];
      if (newestAiMessage) {
        speakText(newestAiMessage.text);
      }
    };

    const handleAddAiMessage = (event: CustomEvent) => {
      // Add AI message as center message after the most recent message
      const newMessage: Message = {
        id: `ai-regenerated-${Date.now()}`,
        text: event.detail.message,
        sender: 'center',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      
      // Scroll to bottom to show the new AI message
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    };

    window.addEventListener('capCheckResult', handleCapCheckResult as EventListener);
    window.addEventListener('capCheckStart', handleCapCheckStart as EventListener);
    window.addEventListener('startTextReader', handleStartTextReader as EventListener);
    window.addEventListener('addAiMessage', handleAddAiMessage as EventListener);
    
    return () => {
      window.removeEventListener('capCheckResult', handleCapCheckResult as EventListener);
      window.removeEventListener('capCheckStart', handleCapCheckStart as EventListener);
      window.removeEventListener('startTextReader', handleStartTextReader as EventListener);
      window.removeEventListener('addAiMessage', handleAddAiMessage as EventListener);
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

  // Handle CAP CHECK - exact same as home page
  const handleCapCheck = () => {
    const timestamp = Date.now();
    
    // Add CAP CHECK message
    const capCheckMessage: Message = {
      id: `cap-check-${timestamp}`,
      text: 'CAP CHECK',
      sender: 'left',
      timestamp: new Date()
    };
    
    // Add ANALYZING message
    const analyzingMessage: Message = {
      id: `analyzing-${timestamp + 1}`,
      text: '⚠️ ANALYZING...',
      sender: 'left',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, capCheckMessage, analyzingMessage]);
    
    // Show the CAP CHECK modal and start flashing
    setShowModal(true);
    setFlashingValue(true);
    
    // Faster flashing between True/False (every 300ms)
    let fadeCount = 0;
    const fadeInterval = setInterval(() => {
      setFlashingValue(prev => !prev);
      fadeCount++;
      
      if (fadeCount >= 6) { // 2 seconds of flashing (6 * 300ms = 1.8s)
        clearInterval(fadeInterval);
        const result = false; // Default to false as requested
        setFlashingValue(result);
        setFinalResult(result);
        setCapCheckResult(result);
        
        // Close modal and add result to chat after showing final result
        setTimeout(() => {
          setShowModal(false);
          
          const resultMessage: Message = {
            id: `result-${timestamp + 2}`,
            text: `Verification Result: FLAGGED AS FALSE - Statement contains potential misinformation`,
            sender: 'center',
            timestamp: new Date(),
            truthVerification: false
          };
          
          setMessages(prev => [...prev, resultMessage]);
        }, 1000);
      }
    }, 300);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: currentSender,
      timestamp: new Date()
    };

    // Track this message as the last user message
    chatActions.setLastUserMessage(input, currentSender);

    setMessages(prev => [...prev, newMessage]);
    
    // Check if the input is "kkk" and add a new block after it
    if (input.trim().toLowerCase() === 'kkk') {
      setTimeout(() => {
        const newBlockMessage: Message = {
          id: `new-block-${Date.now()}`,
          text: 'NEW CONTENT BLOCK - This is a completely new block that appears after "kkk"',
          sender: 'center',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, newBlockMessage]);
      }, 1500);
    }
    
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="py-20 px-8 min-h-screen relative overflow-hidden">
      {/* Floating background orbs */}
      <div className="floating-orb w-96 h-96 top-20 -left-48 animate-float" style={{ animationDelay: '0s' }} />
      <div className="floating-orb w-64 h-64 top-1/2 -right-32 animate-float" style={{ animationDelay: '2s' }} />
      <div className="floating-orb w-80 h-80 bottom-20 left-1/4 animate-float" style={{ animationDelay: '4s' }} />
      
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted/50" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Original AI Status - for scroll detection */}
        {capCheckResult !== null && !showModal && (
          <div ref={statusRef} className="mb-12 animate-slide-up">
            <div className={`ai-status-card mx-auto max-w-md ${
              capCheckResult ? 'ai-status-true' : 'ai-status-false'
            } animate-glow-pulse`}>
              <div className="text-6xl md:text-7xl font-black tracking-tight mb-2">
                AI: {capCheckResult ? 'TRUE' : 'FALSE'}
              </div>
            </div>
            {!capCheckResult && (
              <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="deception-alert max-w-lg mx-auto">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center">
                      <span className="text-xl">⚠️</span>
                    </div>
                    <p className="text-2xl font-bold text-destructive">DECEPTION DETECTED</p>
                  </div>
                  <p className="text-destructive/80 text-lg leading-relaxed">
                    Statement flagged as potentially false or misleading
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sticky AI Status - only visible when scrolled */}
        {capCheckResult !== null && isStatusSticky && !showModal && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
            <div className={`ai-status-card ${
              capCheckResult ? 'ai-status-true' : 'ai-status-false'
            } animate-glow-pulse px-6 py-3`}>
              <div className="text-2xl md:text-3xl font-black tracking-tight">
                AI: {capCheckResult ? 'TRUE' : 'FALSE'}
              </div>
            </div>
            {!capCheckResult && (
              <div className="mt-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="deception-alert max-w-sm mx-auto text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center">
                      <span className="text-sm">⚠️</span>
                    </div>
                    <p className="text-lg font-bold text-destructive">DECEPTION DETECTED</p>
                  </div>
                  <p className="text-destructive/80 text-sm">
                    Statement flagged as potentially false or misleading
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Premium Communication Interface */}
        <div className="glass-card rounded-3xl p-10 shadow-2xl border border-border/20">
          <div className="text-center mb-10">
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
              Real-time Communication
            </h2>

            {/* Premium Person Selector */}
            <div className="flex justify-center space-x-6 mb-10">
              <button
                onClick={() => setCurrentSender('left')}
                className={`px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 ${
                  currentSender === 'left'
                    ? 'premium-button animate-glow-pulse'
                    : 'glass-card hover:scale-105'
                }`}
              >
                Person A
              </button>
              <button
                onClick={() => setCurrentSender('right')}
                className={`px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 ${
                  currentSender === 'right'
                    ? 'premium-button animate-glow-pulse'
                    : 'glass-card hover:scale-105'
                }`}
              >
                Person B
              </button>
            </div>
          </div>

          {/* Premium Chat Messages */}
          <div className="h-64 overflow-y-auto mb-8 space-y-6 scrollbar-thin">
            {messages.map((message, index) => {
              if (message.sender === 'center') {
                // Find the last center message to apply highlighting to the newest AI prompt
                const centerMessages = messages.filter(m => m.sender === 'center');
                const isNewestAiMessage = message === centerMessages[centerMessages.length - 1];
                
                if (isNewestAiMessage) {
                  // AI Content with premium highlighting (newest AI message)
                  const words = message.text.split(' ');
                  return (
                    <div key={message.id} className="w-full mb-6 animate-fade-in">
                      <div className="ai-content-card">
                        <p className={`text-lg leading-relaxed transition-all duration-300 ${
                          isSpeaking ? 'opacity-100' : 'opacity-100'
                        }`}>
                          {words.map((word, wordIdx) => {
                            const isCurrentWord = isSpeaking && wordIdx === currentWordIndex;
                            return (
                              <span
                                key={wordIdx}
                                className={`transition-all duration-300 ${
                                  isCurrentWord 
                                    ? 'text-highlight animate-glow-pulse transform scale-110' 
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
                  );
                } else {
                  // Regular center message (older AI messages)
                  return (
                    <div key={message.id} className="w-full animate-fade-in">
                      <div className="glass-card p-6 rounded-2xl text-muted-foreground">
                        <p className="text-base leading-relaxed">{message.text}</p>
                      </div>
                    </div>
                  );
                }
              }
              
              return (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'right' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`${message.sender === 'left' ? 'message-bubble-left' : 'message-bubble-right'} relative group hover:scale-105 transition-all duration-300`}>
                    <p className="text-base leading-relaxed">{message.text}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.truthVerification !== undefined && (
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs border backdrop-blur-sm ${truthUtils.getVerificationColor(message.truthVerification)}`}>
                          {message.truthVerification === true && <Shield size={12} />}
                          {message.truthVerification === false && <AlertTriangle size={12} />}
                          {message.truthVerification === null && <Clock size={12} />}
                          <span className="font-medium">{truthUtils.getVerificationText(message.truthVerification)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="typing-indicator">
                  <div className="typing-dot" style={{ animationDelay: '0ms' }} />
                  <div className="typing-dot" style={{ animationDelay: '200ms' }} />
                  <div className="typing-dot" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Premium Input Section */}
          <div className="flex space-x-4 mb-6">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Type as ${currentSender === 'left' ? 'Person A' : 'Person B'}...`}
              className="flex-1 premium-input text-foreground placeholder-muted-foreground text-lg"
            />
            <button
              onClick={handleSend}
              className="premium-button flex items-center justify-center min-w-[80px] text-lg hover:scale-110 transition-all duration-300"
            >
              <Send size={24} />
            </button>
          </div>
          
          {/* CAP CHECK Button - Direct Action */}
          <div className="text-center mb-6">
            <button
              onClick={handleCapCheck}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xl rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border-2 border-orange-400/30"
            >
              🚨 CAP CHECK
            </button>
            <p className="text-sm text-muted-foreground mt-2">
              AI-powered fact checking with backend verification
            </p>
          </div>
        </div>
      </div>

      {/* CAP CHECK Modal - Exact same as home page */}
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
    </section>
  );
};
export default MessageInterface;