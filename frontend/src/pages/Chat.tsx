/**
 * Chat Page - Real-time Communication Interface
 * 
 * Contains the MessageInterface component with all chat functionality:
 * - Real-time chat simulation with dual personas
 * - CAP CHECK button and AI verification
 * - Truth verification system
 */
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import MessageInterface from '@/components/MessageInterface';
import { Button } from '@/components/ui/button';

const Chat = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-primary/30">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/">
            <Button variant="ghost" className="gap-2 font-pixel text-white hover:bg-primary/20" 
                    style={{ imageRendering: 'pixelated' }}>
              <ArrowLeft className="h-4 w-4" />
              BACK TO HOME
            </Button>
          </Link>
          
          <div className="flex gap-2">
            <Button variant="default" className="gap-2 hero-button font-pixel" 
                    style={{ imageRendering: 'pixelated' }}>
              <ArrowLeft className="h-4 w-4" />
              CHAT 1
            </Button>
            <Link to="/chat2">
              <Button variant="outline" className="gap-2 font-pixel text-white border-primary/50 hover:bg-primary/20" 
                      style={{ imageRendering: 'pixelated' }}>
                CHAT 2
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Chat Interface */}
      <div className="pt-16">
        <MessageInterface />
      </div>
    </div>
  );
};

export default Chat;