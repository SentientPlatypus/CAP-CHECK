/**
 * MessageInterface Component
 * 
 * Interactive chat interface with integrated text reader:
 * - Dual-sender system (Person A/B) with toggle functionality
 * - Auto-response system with random replies and typing indicators
 * - Global state integration - automatically adds messages when global variables change
 * - Integrated text reader with auto-progression and highlighting
 * - CAP CHECK result display and auto-start functionality
 * - Smooth auto-scrolling to newest messages
 * - Message timestamps and bubble styling
 * - Keyboard shortcuts (Enter to send, Shift+Enter for new line)
 * 
 * Features:
 * - Simulated typing delay (2s) with animated dots
 * - Automatic scroll-to-bottom on new messages
 * - Responsive design with gradient sends button
 * - Real-time timestamp formatting
 * - Global variable monitoring and auto-reset after message creation
 * - Interactive text reader with synchronized highlighting
 */
import { useState, useEffect, useRef } from 'react';
import { Send, Shield, AlertTriangle, Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { chatGlobals, chatActions, truthUtils } from '@/lib/globalState';

// Message data structure
interface Message {
  id: string;
  text: string;
  sender: 'left' | 'right' | 'center';  // Added 'center' for full-width messages
  timestamp: Date;
  truthVerification?: boolean | null; // Truth status for this message
}

// Demo podcast/article content for text reader
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

const MessageInterface = () => {
  // Chat state management
  // Initial demo messages including explanation
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '0', 
      text: chatGlobals.chatExplanation, 
      sender: 'center', 
      timestamp: new Date()
    },
    { id: '1', text: 'Hey! How are you doing?', sender: 'left', timestamp: new Date() },
    { id: '2', text: 'I\'m great! Just checking out this amazing interface.', sender: 'right', timestamp: new Date() },
    { id: '3', text: 'The animations are so smooth!', sender: 'left', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');                    // Current message input
  const [isTyping, setIsTyping] = useState(false);           // Show typing indicator
  const [currentSender, setCurrentSender] = useState<'left' | 'right'>('right'); // Active sender
  const messagesEndRef = useRef<HTMLDivElement>(null);       // For auto-scrolling

  // Text reader state
  const [currentParagraph, setCurrentParagraph] = useState(0);  // Current active paragraph index
  const [isPlaying, setIsPlaying] = useState(false);            // Play/pause state
  const [progress, setProgress] = useState(0);                  // Progress within current paragraph (0-100)
  const [capCheckResult, setCapCheckResult] = useState<boolean | null>(null); // CAP CHECK result display

  /**
   * Smooth scroll to the bottom of messages when new ones arrive
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll on new messages or typing indicators
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Auto-progression timer effect for text reader
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

  /**
   * Monitor global variables and automatically add messages when they change
   * Resets variables after adding them to chat
   */
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
        chatActions.setPersonOneInput(''); // Reset after adding
        chatActions.setTruthVerification(null); // Reset verification
        
        // Start text reader when CAP CHECK is received
        if (newMessage.text === 'CAP CHECK') {
          // Add text content as messages
          setTimeout(() => {
            podcastText.forEach((paragraph, index) => {
              setTimeout(() => {
                const textMessage: Message = {
                  id: `text-${index}`,
                  text: paragraph,
                  sender: 'center' as any, // Special sender for full-width
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, textMessage]);
              }, index * 200); // Stagger the messages
            });
          }, 1000);
        }
        
        // No auto-response - only global variable inputs
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
        chatActions.setPersonTwoInput(''); // Reset after adding
        chatActions.setTruthVerification(null); // Reset verification
        
        // No auto-response - only global variable inputs
      }
    };

    // Listen for CAP CHECK results and auto-start events
    const handleCapCheckResult = (event: CustomEvent) => {
      setCapCheckResult(event.detail.result);
    };

    const handleStartTextReader = () => {
      // Auto-start the text reader when triggered by CAP CHECK
      if (currentParagraph >= podcastText.length) {
        setCurrentParagraph(0); // Reset if finished
        setProgress(0);
      }
      setIsPlaying(true);
    };

    // Check for changes every 100ms
    const interval = setInterval(checkGlobalInputs, 100);
    
    window.addEventListener('capCheckResult', handleCapCheckResult as EventListener);
    window.addEventListener('startTextReader', handleStartTextReader as EventListener);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('capCheckResult', handleCapCheckResult as EventListener);
      window.removeEventListener('startTextReader', handleStartTextReader as EventListener);
    };
  }, [currentParagraph]);

  // Auto-responses removed - Person A and B only respond via global variables

  /**
   * Send message and trigger auto-response
   * Simulates real-time conversation with 500ms + 2s delays
   */
  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: currentSender,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    // No auto-response - only global variable inputs
  };

  /**
   * Handle keyboard shortcuts - Enter to send, Shift+Enter for new line
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Toggle play/pause for text reader, or restart if finished
   */
  const togglePlayback = () => {
    if (currentParagraph >= podcastText.length) {
      resetReader();  // Restart from beginning if finished
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  /**
   * Reset text reader to initial state
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
    <section data-section="text-reader" className="py-20 px-8 bg-gradient-to-b from-card to-muted">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Real-time Communication
          </h2>
          <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
            {chatGlobals.chatExplanation}
          </p>

          {/* CAP CHECK Result Display - More Apparent */}
          {capCheckResult !== null && (
            <div className="mb-8 animate-fade-in">
              <div className="text-center mb-4">
                <h3 className="text-3xl md:text-4xl font-bold text-primary mb-2">CAP CHECK</h3>
              </div>
              <div className={`inline-block px-8 py-4 rounded-2xl text-2xl md:text-3xl font-bold border-4 shadow-2xl ${
                capCheckResult 
                  ? 'bg-green-500/30 text-green-300 border-green-400 shadow-green-500/50' 
                  : 'bg-red-500/30 text-red-300 border-red-400 shadow-red-500/50'
              }`}>
                {capCheckResult ? 'TRUE' : 'FALSE'}
              </div>
              {!capCheckResult && (
                <div className="mt-4 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-300 max-w-md mx-auto">
                  <p className="text-lg font-semibold">⚠️ DECEPTION DETECTED</p>
                  <p className="text-sm text-red-400 mt-1">Statement flagged as potentially false or misleading</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setCurrentSender('left')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                currentSender === 'left'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Person A
            </button>
            <button
              onClick={() => setCurrentSender('right')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                currentSender === 'right'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Person B
            </button>
          </div>
        </div>

        <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-border">
          {/* Chat Messages Area */}
          <div className="h-96 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20">
            {messages.map((message, index) => {
              // Full-width messages (explanation text and interactive content)
              if (message.sender === 'center') {
                // Check if this is explanation text (id '0') or interactive text content
                if (message.id === '0') {
                  return (
                    <div key={message.id} className="w-full">
                      <div className="w-full p-4 rounded-lg bg-card/80 border border-border/50 text-muted-foreground">
                        <p className="text-sm leading-relaxed">{message.text}</p>
                      </div>
                    </div>
                  );
                }
                
                // Interactive text content
                const textIndex = parseInt(message.id.replace('text-', ''));
                const isActive = textIndex === currentParagraph && isPlaying;
                const isRead = textIndex < currentParagraph;
                
                return (
                  <div key={message.id} className="w-full">
                    <div 
                      className={`w-full p-4 rounded-lg border transition-all duration-500 ${
                        isActive 
                          ? 'bg-primary/20 border-primary/50 text-foreground shadow-lg scale-[1.02]'
                          : isRead
                          ? 'bg-muted/50 border-muted text-muted-foreground opacity-70'
                          : 'bg-card/50 border-border text-muted-foreground opacity-50'
                      }`}
                    >
                      <p className="text-base leading-relaxed">{message.text}</p>
                      {isActive && (
                        <div className="mt-2 w-full bg-muted rounded-full h-1 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-100 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              
              // Regular chat messages
              return (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'right' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`${message.sender === 'left' ? 'message-bubble-left' : 'message-bubble-right'} relative`}>
                    <p className="text-sm">{message.text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-60">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {/* Truth verification badge */}
                      {message.truthVerification !== undefined && (
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${truthUtils.getVerificationColor(message.truthVerification)}`}>
                          {message.truthVerification === true && <Shield size={10} />}
                          {message.truthVerification === false && <AlertTriangle size={10} />}
                          {message.truthVerification === null && <Clock size={10} />}
                          <span>{truthUtils.getVerificationText(message.truthVerification)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="typing-indicator">
                  <div className="typing-dot" style={{ animationDelay: '0ms' }} />
                  <div className="typing-dot" style={{ animationDelay: '200ms' }} />
                  <div className="typing-dot" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Type as ${currentSender === 'left' ? 'Person A' : 'Person B'}...`}
              className="flex-1 px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MessageInterface;