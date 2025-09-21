/**
 * MessageInterface Component
 * 
 * Interactive chat with AI feedback and text highlighting
 */
import { useState, useEffect, useRef } from 'react';
import { Send, Shield, AlertTriangle, Clock, Volume2 } from 'lucide-react';
import { chatGlobals, chatActions, truthUtils } from '@/lib/globalState';
import debatePixelArt from '@/assets/debate-pixel-art.png';

// Message data structure
interface Message {
  id: string;
  text: string;
  sender: 'left' | 'right' | 'center';
  timestamp: Date;
  truthVerification?: boolean | null;
}

// Demo content for AI reading
const aiContent = ["Welcome to our AI-powered content verification system. This technology analyzes statements in real-time to determine their accuracy."];

// AI verification display status (for now always FALSE)
const aiContentVerificationStatus = false;
const MessageInterface = () => {
  // Chat state management
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: 'Hey! How are you doing?',
    sender: 'left',
    timestamp: new Date()
  }, {
    id: '2',
    text: 'I\'m great! Just checking out this amazing interface.',
    sender: 'right',
    timestamp: new Date()
  }, {
    id: 'ai-content',
    text: aiContent.join(' '),
    sender: 'center',
    timestamp: new Date()
  }]);
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

  // Spacebar shortcut for CAP CHECK
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if spacebar is pressed and not in an input field
      if (event.code === 'Space' && event.target === document.body) {
        event.preventDefault();
        handleCapCheck();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Monitor global variables for Person A and B inputs
  useEffect(() => {
    const checkGlobalInputs = () => {
      // Check Person A input
      if (chatGlobals.personOneInput.trim()) {
        const lastMessage = messages[messages.length - 1];
        const shouldUpdateExisting = lastMessage && lastMessage.sender === 'left';
        
        if (shouldUpdateExisting) {
          // Update existing message text
          setMessages(prev => prev.map((msg, index) => 
            index === prev.length - 1 
              ? { ...msg, text: chatGlobals.personOneInput.trim(), truthVerification: chatGlobals.truthVerification }
              : msg
          ));
        } else {
          // Create new message for speaker change
          const newMessage: Message = {
            id: Date.now().toString(),
            text: chatGlobals.personOneInput.trim(),
            sender: 'left',
            timestamp: new Date(),
            truthVerification: chatGlobals.truthVerification
          };
          setMessages(prev => [...prev, newMessage]);
        }
        chatActions.setPersonOneInput('');
        chatActions.setTruthVerification(null);
      }

      // Check Person B input
      if (chatGlobals.personTwoInput.trim()) {
        const lastMessage = messages[messages.length - 1];
        const shouldUpdateExisting = lastMessage && lastMessage.sender === 'right';
        
        if (shouldUpdateExisting) {
          // Update existing message text
          setMessages(prev => prev.map((msg, index) => 
            index === prev.length - 1 
              ? { ...msg, text: chatGlobals.personTwoInput.trim(), truthVerification: chatGlobals.truthVerification }
              : msg
          ));
        } else {
          // Create new message for speaker change
          const newMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: chatGlobals.personTwoInput.trim(),
            sender: 'right',
            timestamp: new Date(),
            truthVerification: chatGlobals.truthVerification
          };
          setMessages(prev => [...prev, newMessage]);
        }
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
    const intervalMs = 60 * 1000 / wordsPerMinute;
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

  // Handle CAP CHECK - simplified version with centered colored messages
  const handleCapCheck = () => {
    const timestamp = Date.now();

    // Add CAP Check message
    const capCheckMessage: Message = {
      id: `cap-check-${timestamp}`,
      text: 'CAP Check',
      sender: 'left',
      timestamp: new Date()
    };

    // Add ANALYZING message
    const analyzingMessage: Message = {
      id: `analyzing-${timestamp + 1}`,
      text: '⚠️ ANALYZING...',
      sender: 'center',
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
      if (fadeCount >= 6) {
        // 2 seconds of flashing (6 * 300ms = 1.8s)
        clearInterval(fadeInterval);
        
        // Randomly select result: CAP (false), SUS (null), or FACT (true)
        const randomResult = Math.random();
        let result: boolean | null;
        let resultText: string;
        let explanation: string;
        
        if (randomResult < 0.6) {
          // 60% chance for CAP (false)
          result = false;
          resultText = "🚨 CAP";
          explanation = "Statement flagged as false or misleading. Multiple sources contradict this claim.";
        } else if (randomResult < 0.8) {
          // 20% chance for SUS (null)
          result = null;
          resultText = "⚠️ SUS";
          explanation = "Statement requires further verification. Insufficient evidence to confirm accuracy.";
        } else {
          // 20% chance for FACT (true)
          result = true;
          resultText = "✅ FACT";
          explanation = "Statement verified as accurate. Multiple reliable sources support this claim.";
        }
        
        setFlashingValue(result);
        setFinalResult(result);
        setCapCheckResult(result);

        // Close modal and add result to chat after showing final result
        setTimeout(() => {
          setShowModal(false);
          const resultMessage: Message = {
            id: `result-${timestamp + 2}`,
            text: `${resultText}\n${explanation}`,
            sender: 'center',
            timestamp: new Date(),
            truthVerification: result
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
  return <section className="py-20 px-8 min-h-screen relative overflow-hidden">
      {/* Floating background orbs */}
      <div className="floating-orb w-96 h-96 top-20 -left-48 animate-float" style={{
      animationDelay: '0s'
    }} />
      <div className="floating-orb w-64 h-64 top-1/2 -right-32 animate-float" style={{
      animationDelay: '2s'
    }} />
      <div className="floating-orb w-80 h-80 bottom-20 left-1/4 animate-float" style={{
      animationDelay: '4s'
    }} />
      
      {/* Premium animated pixel background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted/50">
        {/* Animated background particles */}
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="debate-particle absolute w-1 h-1 bg-primary/60 rounded-sm animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              imageRendering: 'pixelated'
            }}
          />
        ))}

        {/* Pixel art debating people */}
        {/* Left debater */}
        <div 
          className="pixel-person absolute left-10 top-1/3 w-12 h-16 bg-gradient-to-b from-blue-400 to-blue-600 rounded-sm opacity-30 animate-pulse"
          style={{ 
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
            imageRendering: 'pixelated',
            animationDelay: '0.5s'
          }}
        >
          {/* Pixelated face */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-sm"></div>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-black rounded-sm"></div>
          {/* Speech bubble */}
          <div className="absolute -top-6 -right-4 w-8 h-4 bg-white/80 rounded-sm text-[6px] flex items-center justify-center font-pixel text-black">
            FACT?
          </div>
        </div>

        {/* Right debater */}
        <div 
          className="pixel-person absolute right-10 top-2/3 w-12 h-16 bg-gradient-to-b from-red-400 to-red-600 rounded-sm opacity-30 animate-pulse"
          style={{ 
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
            imageRendering: 'pixelated',
            animationDelay: '1s'
          }}
        >
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-sm"></div>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-black rounded-sm"></div>
          {/* Speech bubble */}
          <div className="absolute -top-6 -left-4 w-8 h-4 bg-white/80 rounded-sm text-[6px] flex items-center justify-center font-pixel text-black">
            CAP!
          </div>
        </div>

        {/* Additional floating pixels */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`floating-${i}`}
            className="absolute w-2 h-2 bg-primary/40 rounded-sm animate-bounce"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              imageRendering: 'pixelated'
            }}
          />
        ))}
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Premium Communication Interface */}
        <div className="glass-card rounded-3xl p-10 shadow-2xl border border-border/20 relative">
          {/* Pixel art debaters in corner */}
          <div className="absolute -top-2 -right-2">
            <img 
              src={debatePixelArt}
              alt="Pixel art of two people debating"
              className="w-40 h-auto opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105"
              style={{ 
                imageRendering: 'pixelated',
                filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))',
                transform: 'rotate(8deg)'
              }}
            />
          </div>
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-pixel mb-6 text-white animate-slide-up" style={{
            textShadow: '4px 4px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
            imageRendering: 'pixelated'
          }}>The Courtroom</h2>

            {/* Premium Person Selector */}
            <div className="flex justify-center space-x-6 mb-10">
              <button onClick={() => setCurrentSender('left')} className={`px-8 py-4 rounded-2xl text-lg font-pixel transition-all duration-300 border-2 ${currentSender === 'left' ? 'bg-primary text-primary-foreground border-primary animate-glow-pulse' : 'glass-card hover:scale-105 text-white border-primary/30 hover:bg-primary/20'}`} style={{
              imageRendering: 'pixelated'
            }}>
                PERSON A
              </button>
              <button onClick={() => setCurrentSender('right')} className={`px-8 py-4 rounded-2xl text-lg font-pixel transition-all duration-300 border-2 ${currentSender === 'right' ? 'bg-primary text-primary-foreground border-primary animate-glow-pulse' : 'glass-card hover:scale-105 text-white border-primary/30 hover:bg-primary/20'}`} style={{
              imageRendering: 'pixelated'
            }}>
                PERSON B
              </button>
            </div>
          </div>

          {/* Premium Chat Messages */}
          <div className="h-64 overflow-y-auto mb-8 space-y-6 scrollbar-thin border border-border/40 rounded-xl p-4 bg-black/10">
            {messages.map((message, index) => {
            if (message.sender === 'center') {
              // Check if this is a CAP CHECK result message
              const isCapResult = message.text.includes('🚨 CAP') || message.text.includes('⚠️ SUS') || message.text.includes('✅ FACT');
              
              if (isCapResult) {
                // CAP CHECK result with color coding
                const lines = message.text.split('\n');
                const resultLine = lines[0];
                const explanationLine = lines[1] || '';
                
                let bgColor = 'bg-red-500/20';
                let borderColor = 'border-red-500';
                let textColor = 'text-red-400';
                
                if (resultLine.includes('SUS')) {
                  bgColor = 'bg-yellow-500/20';
                  borderColor = 'border-yellow-500';
                  textColor = 'text-yellow-400';
                } else if (resultLine.includes('FACT')) {
                  bgColor = 'bg-green-500/20';
                  borderColor = 'border-green-500';
                  textColor = 'text-green-400';
                }
                
                return <div key={message.id} className="w-full flex justify-center mb-6 animate-fade-in">
                      <div className={`${bgColor} ${borderColor} border-2 p-6 rounded-2xl max-w-md text-center`}>
                        <p className={`text-2xl font-pixel ${textColor} mb-2`} style={{
                      imageRendering: 'pixelated'
                    }}>
                          {resultLine}
                        </p>
                        {explanationLine && <p className="text-sm font-pixel text-white/80 leading-relaxed" style={{
                      imageRendering: 'pixelated'
                    }}>
                          {explanationLine}
                        </p>}
                      </div>
                    </div>;
              }
              
              // Find the last center message to apply highlighting to the newest AI prompt
              const centerMessages = messages.filter(m => m.sender === 'center');
              const isNewestAiMessage = message === centerMessages[centerMessages.length - 1];
              if (isNewestAiMessage && !isCapResult) {
                // AI Content with premium highlighting (newest AI message)
                const words = message.text.split(' ');
                return <div key={message.id} className="w-full mb-6 animate-fade-in">
                      <div className="ai-content-card border-2 border-primary/30">
                        <p className={`text-lg leading-relaxed transition-all duration-300 font-pixel text-white ${isSpeaking ? 'opacity-100' : 'opacity-100'}`} style={{
                      imageRendering: 'pixelated'
                    }}>
                          {words.map((word, wordIdx) => {
                        const isCurrentWord = isSpeaking && wordIdx === currentWordIndex;
                        return <span key={wordIdx} className={`transition-all duration-300 ${isCurrentWord ? 'text-highlight animate-glow-pulse transform scale-110' : ''}`}>
                                {word}{' '}
                              </span>;
                      })}
                        </p>
                      </div>
                    </div>;
              } else {
                // Regular center message (older AI messages)
                return <div key={message.id} className="w-full animate-fade-in">
                      <div className="glass-card p-6 rounded-2xl border-2 border-primary/20">
                        <p className="text-base leading-relaxed font-pixel text-white" style={{
                      imageRendering: 'pixelated'
                    }}>
                          {message.text}
                        </p>
                      </div>
                    </div>;
              }
            }
            return <div key={message.id} className={`flex ${message.sender === 'right' ? 'justify-end' : 'justify-start'} animate-fade-in`} style={{
              animationDelay: `${index * 0.1}s`
            }}>
                  <div className={`${message.sender === 'left' ? 'message-bubble-left border-2 border-primary/30' : 'message-bubble-right border-2 border-accent/30'} relative group hover:scale-105 transition-all duration-300`}>
                    <p className="text-base leading-relaxed font-pixel" style={{
                  imageRendering: 'pixelated'
                }}>
                      {message.text}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs opacity-70 font-pixel" style={{
                    imageRendering: 'pixelated'
                  }}>
                        {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                      </span>
                      {message.truthVerification !== undefined && <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs border backdrop-blur-sm font-pixel ${truthUtils.getVerificationColor(message.truthVerification)}`} style={{
                    imageRendering: 'pixelated'
                  }}>
                          {message.truthVerification === true && <Shield size={12} />}
                          {message.truthVerification === false && <AlertTriangle size={12} />}
                          {message.truthVerification === null && <Clock size={12} />}
                          <span className="font-medium">{truthUtils.getVerificationText(message.truthVerification)}</span>
                        </div>}
                    </div>
                  </div>
                </div>;
          })}
            
            {isTyping && <div className="flex justify-start animate-fade-in">
                <div className="typing-indicator">
                  <div className="typing-dot" style={{
                animationDelay: '0ms'
              }} />
                  <div className="typing-dot" style={{
                animationDelay: '200ms'
              }} />
                  <div className="typing-dot" style={{
                animationDelay: '400ms'
              }} />
                </div>
              </div>}
            <div ref={messagesEndRef} />
          </div>
          
          
          {/* CAP CHECK Button - Direct Action */}
          <div className="text-center mb-6">
            <button onClick={handleCapCheck} className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-pixel text-xl rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border-2 border-red-400/50" style={{
            textShadow: '2px 2px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
            imageRendering: 'pixelated'
          }}>🚨 CAP CHECK 🚨</button>
          </div>
        </div>
      </div>

      {/* CAP CHECK Modal - Exact same as home page */}
      {showModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-background/95 backdrop-blur-md rounded-2xl p-16 border border-primary/50 shadow-2xl max-w-2xl w-full mx-4 animate-scale-in">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-pixel mb-8 text-white" style={{
            textShadow: '4px 4px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
            imageRendering: 'pixelated'
          }}>
                CAP CHECK
              </h1>
              
              <div className="mb-8">
                <div className={`inline-block px-12 py-6 rounded-2xl text-6xl font-pixel border-4 transition-all duration-200 ease-in-out ${flashingValue ? 'bg-green-500/20 text-green-400 border-green-500' : 'bg-red-500/20 text-red-400 border-red-500'}`} style={{
              imageRendering: 'pixelated'
            }}>
                  {flashingValue ? 'TRUE' : 'FALSE'}
                </div>
              </div>
              
              <p className="text-white font-pixel text-lg bg-black/60 px-4 py-2 rounded-xl border border-primary/30" style={{
            imageRendering: 'pixelated'
          }}>
                AI ANALYSIS IN PROGRESS...
              </p>
            </div>
          </div>
        </div>}
    </section>;
};
export default MessageInterface;