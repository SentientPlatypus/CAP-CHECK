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
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex gap-2">
            <Link to="/chat">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Chat 1
              </Button>
            </Link>
            <Button variant="default" className="gap-2">
              Chat 2
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Empty Content Area */}
      <div className="pt-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-muted-foreground mb-4">
            Chat Page 2
          </h1>
          <p className="text-lg text-muted-foreground">
            Coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat2;