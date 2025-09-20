/**
 * MessageInterface Component
 * 
 * Interactive chat interface demonstrating real-time messaging:
 * - Dual-sender system (Person A/B) with toggle functionality
 * - Auto-response system with random replies and typing indicators
 * - Global state integration - automatically adds messages when global variables change
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
 */
import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { chatGlobals, chatActions } from '@/lib/globalState';

// Message data structure
interface Message {
  id: string;
  text: string;
  sender: 'left' | 'right';  // Which side of the chat (Person A/B)
  timestamp: Date;
}

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
          timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
        chatActions.setPersonOneInput(''); // Reset after adding
        
        // Trigger auto-response
        triggerAutoResponse('left');
      }
      
      // Check Person B input
      if (chatGlobals.personTwoInput.trim()) {
        const newMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: chatGlobals.personTwoInput.trim(),
          sender: 'right',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
        chatActions.setPersonTwoInput(''); // Reset after adding
        
        // Trigger auto-response
        triggerAutoResponse('right');
      }
    };

    // Check for changes every 100ms
    const interval = setInterval(checkGlobalInputs, 100);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <section className="py-20 px-8 bg-gradient-to-b from-card to-muted">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Real-time Communication
          </h2>
          <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
            {chatGlobals.chatExplanation}
          </p>
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
          <div className="h-96 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'right' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={message.sender === 'left' ? 'message-bubble-left' : 'message-bubble-right'}>
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs opacity-60 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
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
        </div>
      </div>
    </section>
  );
};

export default MessageInterface;