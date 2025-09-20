import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          CAP CHECK
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button 
              variant={location.pathname === '/' ? 'default' : 'ghost'}
              size="sm"
            >
              Home
            </Button>
          </Link>
          <Link to="/chat-select">
            <Button 
              variant={location.pathname.includes('/chat') ? 'default' : 'ghost'}
              size="sm"
            >
              Chat
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;