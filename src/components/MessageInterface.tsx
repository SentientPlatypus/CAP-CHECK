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

  // AI Verification Status
  const [aiVerificationStatus, setAiVerificationStatus] = useState<boolean>(false);

  // Check for API key and fetch AI verification status on mount
  useEffect(() => {
    const apiKey = localStorage.getItem('ELEVENLABS_API_KEY');
    setHasApiKey(!!apiKey);
    
    // Fetch AI verification status from backend
    const fetchVerificationStatus = async () => {
      const status = await chatActions.fetchAiVerificationStatus();
      setAiVerificationStatus(status);
    };
    
    fetchVerificationStatus();
  }, []);

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

    const handleStartTextReader = () => {
      speakText(aiContent.join(' '));
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
    window.addEventListener('startTextReader', handleStartTextReader as EventListener);
    window.addEventListener('addAiMessage', handleAddAiMessage as EventListener);
    
    return () => {
      window.removeEventListener('capCheckResult', handleCapCheckResult as EventListener);
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
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

        {/* Combined Communication & AI Content Reader */}
        <div className="bg-background/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-border">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Real-time Communication & AI Reader
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {chatGlobals.chatExplanation}
            </p>

            <div className="flex justify-center space-x-4 mb-6">
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

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto mb-6 space-y-4 scrollbar-thin scrollbar-thumb-primary/20">
            {messages.map((message) => {
              if (message.sender === 'center') {
                if (message.id === 'ai-content') {
                  // AI Content with highlighting
                  const words = message.text.split(' ');
                  return (
                    <div key={message.id} className="w-full mb-4">
                      <div className="w-full p-6 rounded-lg bg-card/50 border border-border/50">
                        <div className="text-center mb-4">
                          <span className={`text-lg font-bold ${
                            aiVerificationStatus 
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}>
                            {aiVerificationStatus ? 'TRUE' : 'FALSE'}
                          </span>
                        </div>
                        <p className={`text-base leading-relaxed transition-all duration-300 ${
                          isSpeaking ? 'opacity-100' : 'opacity-100'
                        }`}>
                          {words.map((word, wordIdx) => {
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
                  );
                } else {
                  // Regular center message
                  return (
                    <div key={message.id} className="w-full">
                      <div className="w-full p-4 rounded-lg bg-card/80 border border-border/50 text-muted-foreground">
                        <p className="text-sm leading-relaxed">{message.text}</p>
                      </div>
                    </div>
                  );
                }
              }
              
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
          
          <div className="flex space-x-3 mb-8">
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
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center min-w-[60px]"
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