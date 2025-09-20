/**
 * Chat Selection Page - Choose between chat options
 * 
 * Hub page to navigate to different chat interfaces
 */
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ChatSelect = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>
      
      {/* Chat Selection Content */}
      <div className="pt-20 flex items-center justify-center min-h-screen p-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Choose Your Chat Experience
            </h1>
            <p className="text-lg text-muted-foreground">
              Select from our available chat interfaces
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Chat 1 Option */}
            <Card className="hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
              <Link to="/chat">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Chat 1</CardTitle>
                  <CardDescription className="text-base">
                    Real-time communication with AI fact-checking
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                    <li>• Dual persona simulation (Person A & B)</li>
                    <li>• CAP CHECK verification system</li>
                    <li>• Truth verification with visual feedback</li>
                    <li>• Interactive message interface</li>
                  </ul>
                  <Button className="w-full" size="lg">
                    Enter Chat 1
                  </Button>
                </CardContent>
              </Link>
            </Card>

            {/* Chat 2 Option */}
            <Card className="hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
              <Link to="/chat2">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Chat 2</CardTitle>
                  <CardDescription className="text-base">
                    Coming soon - Advanced chat features
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                    <li>• Enhanced AI capabilities</li>
                    <li>• Additional verification methods</li>
                    <li>• Extended conversation features</li>
                    <li>• More customization options</li>
                  </ul>
                  <Button className="w-full" size="lg" variant="outline">
                    Explore Chat 2
                  </Button>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSelect;