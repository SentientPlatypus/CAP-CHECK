/**
 * Chat Page - Real-time Communication Interface
 * 
 * Dedicated page for the AI-powered chat with truth verification
 */
import { Link } from 'react-router-dom';
import MessageInterface from '@/components/MessageInterface';
import { Home, ArrowLeft } from 'lucide-react';

const Chat = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-6 left-6 z-50">
        <Link 
          to="/" 
          className="glass-card px-6 py-3 rounded-2xl flex items-center space-x-3 hover:scale-105 transition-all duration-300 text-foreground hover:text-primary"
        >
          <ArrowLeft size={20} />
          <Home size={20} />
          <span className="font-semibold">Back to Home</span>
        </Link>
      </nav>

      <MessageInterface />
    </div>
  );
};

export default Chat;