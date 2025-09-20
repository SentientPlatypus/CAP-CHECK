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
  sender: 'left' | 'right';  // Which side of the chat (Person A/B)
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
  // Initial demo messages
  const [messages, setMessages] = useState<Message[]>([
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
  const [showTextReader, setShowTextReader] = useState(false);  // Toggle text reader visibility
  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]); // Individual paragraph refs

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
    if (isPlaying && currentParagraph < podcastText.length && showTextReader) {
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
  }, [isPlaying, currentParagraph, showTextReader]);

  // Auto-scroll current paragraph to center of view
  useEffect(() => {
    if (showTextReader && paragraphRefs.current[currentParagraph]) {
      paragraphRefs.current[currentParagraph]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'  // Keep current paragraph centered
      });
    }
  }, [currentParagraph, showTextReader]);

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
        
        // Show text reader when CAP CHECK is received
        if (newMessage.text === 'CAP CHECK') {
          setShowTextReader(true);
        }
        
        // Trigger auto-response
        triggerAutoResponse('left');
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
        
        // Trigger auto-response
        triggerAutoResponse('right');
      }
    };

    // Listen for CAP CHECK results and auto-start events
    const handleCapCheckResult = (event: CustomEvent) => {
      setCapCheckResult(event.detail.result);
    };

    const handleStartTextReader = () => {
      // Auto-start the text reader when triggered by CAP CHECK
      setShowTextReader(true);
      if (currentParagraph >= podcastText.length) {
        resetReader(); // Reset if already finished
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

  /**
   * Trigger auto-response from the opposite sender
   * Simulates real-time conversation with 500ms + 2s delays
   */
  const triggerAutoResponse = (fromSender: 'left' | 'right') => {
    setTimeout(() => {
      setIsTyping(true);  // Show typing indicator
      setTimeout(() => {
        // Random response selection
        const responses = [
          'That\'s interesting!',
          'I totally agree!',
          'Thanks for sharing!',
          'Cool perspective!',
          'Tell me more about that.',
        ];
        const response: Message = {
          id: (Date.now() + Math.random()).toString(),
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: fromSender === 'left' ? 'right' : 'left',  // Opposite sender
          timestamp: new Date()
        };
        setMessages(prev => [...prev, response]);
        setIsTyping(false);
      }, 2000);  // 2 second typing simulation
    }, 500);     // 0.5 second delay before typing starts
  };

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

    // Trigger auto-response
    triggerAutoResponse(currentSender);
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
            Real-time Communication {showTextReader && '& Interactive Text Reader'}
          </h2>
          <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
            {showTextReader ? 'Interactive text reader now active within the chat interface' : chatGlobals.chatExplanation}
          </p>

          {/* CAP CHECK Result Display - More Apparent */}
          {capCheckResult !== null && (
            <div className="mb-8 animate-fade-in">
              <div className={`inline-block px-8 py-4 rounded-2xl text-2xl md:text-3xl font-bold border-4 shadow-2xl ${
                capCheckResult 
                  ? 'bg-green-500/30 text-green-300 border-green-400 shadow-green-500/50' 
                  : 'bg-red-500/30 text-red-300 border-red-400 shadow-red-500/50'
              }`}>
                ANALYSIS RESULT: {capCheckResult ? 'TRUE' : 'FALSE'}
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
          {!showTextReader ? (
            /* Regular Chat Interface */
            <>
              <div className="h-96 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20">
                {messages.map((message) => (
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
                ))}
                
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
            </>
          ) : (
            /* Integrated Text Reader Interface */
            <>
              {/* Text Reader Controls */}
              <div className="flex items-center justify-center space-x-4 mb-6">
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
                <button
                  onClick={() => setShowTextReader(false)}
                  className="bg-muted text-muted-foreground px-4 py-2 rounded-lg transition-all duration-200 hover:bg-muted/80"
                >
                  Minimize Reader
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2 mb-6 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-100 ease-out"
                  style={{ 
                    width: `${(currentParagraph * 100 + progress) / podcastText.length}%` 
                  }}
                />
              </div>

              {/* Chat Messages (condensed view) */}
              <div className="h-32 overflow-y-auto mb-4 space-y-2 scrollbar-thin scrollbar-thumb-primary/20">
                {messages.slice(-3).map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'right' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`${message.sender === 'left' ? 'message-bubble-left' : 'message-bubble-right'} relative text-xs`}>
                      <p>{message.text}</p>
                      {message.truthVerification !== undefined && (
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border mt-1 ${truthUtils.getVerificationColor(message.truthVerification)}`}>
                          {message.truthVerification === true && <Shield size={8} />}
                          {message.truthVerification === false && <AlertTriangle size={8} />}
                          <span className="text-xs">{truthUtils.getVerificationText(message.truthVerification)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Text Content */}
              <div className="max-h-64 overflow-y-auto space-y-4 text-lg leading-relaxed scrollbar-thin scrollbar-thumb-primary/20 border-t border-border pt-4">
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
                <div className="text-center mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
                  <p className="text-primary font-semibold mb-2">Reading Complete!</p>
                  <p className="text-muted-foreground text-sm">
                    Click reset to start over or minimize to continue with other features.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default MessageInterface;