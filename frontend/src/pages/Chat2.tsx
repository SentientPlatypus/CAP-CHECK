/**
 * Chat Page 2 - Secondary Chat Interface
 * 
 * Empty for now - placeholder for future functionality
 */
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Chat2 = () => {
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
            <Link to="/chat">
              <Button variant="outline" className="gap-2 font-pixel text-white border-primary/50 hover:bg-primary/20" 
                      style={{ imageRendering: 'pixelated' }}>
                <ArrowLeft className="h-4 w-4" />
                CHAT 1
              </Button>
            </Link>
            <Button variant="default" className="gap-2 hero-button font-pixel" 
                    style={{ imageRendering: 'pixelated' }}>
              CHAT 2
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Empty Content Area */}
      <div className="pt-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-pixel text-white mb-4"
              style={{ 
                textShadow: '4px 4px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
                imageRendering: 'pixelated'
              }}>
            CHAT PAGE 2
          </h1>
          <p className="text-lg font-pixel text-white bg-black/60 px-6 py-3 rounded-xl border border-primary/30"
             style={{ imageRendering: 'pixelated' }}>
            COMING SOON...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat2;