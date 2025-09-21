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
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-primary/30">
        <div className="container mx-auto px-4 py-3">
          <Link to="/">
            <Button variant="ghost" className="gap-2 font-pixel text-white hover:bg-primary/20" 
                    style={{ imageRendering: 'pixelated' }}>
              <ArrowLeft className="h-4 w-4" />
              BACK TO HOME
            </Button>
          </Link>
        </div>
      </header>
      
      {/* Chat Selection Content */}
      <div className="pt-20 flex items-center justify-center min-h-screen p-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 font-pixel text-white" 
                style={{ 
                  textShadow: '4px 4px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
                  imageRendering: 'pixelated'
                }}>
              CHOOSE YOUR CHAT EXPERIENCE
            </h1>
            <p className="text-lg font-pixel text-white bg-black/60 px-6 py-3 rounded-xl border border-primary/30 inline-block"
               style={{ imageRendering: 'pixelated' }}>
              SELECT FROM OUR AVAILABLE CHAT INTERFACES
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Chat 1 Option */}
            <Card className="hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-primary/30 hover:border-primary/50 glass-card">
              <Link to="/chat">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-4 border-2 border-primary/50"
                       style={{ imageRendering: 'pixelated' }}>
                    <MessageCircle className="h-8 w-8 text-background" />
                  </div>
                  <CardTitle className="text-2xl font-pixel text-white" 
                             style={{ imageRendering: 'pixelated' }}>
                    CHAT 1
                  </CardTitle>
                  <CardDescription className="text-base font-pixel text-primary bg-black/40 px-4 py-2 rounded-lg border border-primary/20"
                                   style={{ imageRendering: 'pixelated' }}>
                    REAL-TIME COMMUNICATION WITH AI FACT-CHECKING
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <ul className="text-sm font-pixel text-white space-y-2 mb-6 bg-black/40 px-4 py-4 rounded-lg border border-primary/20"
                      style={{ imageRendering: 'pixelated' }}>
                    <li>• DUAL PERSONA SIMULATION (PERSON A & B)</li>
                    <li>• CAP CHECK VERIFICATION SYSTEM</li>
                    <li>• TRUTH VERIFICATION WITH VISUAL FEEDBACK</li>
                    <li>• INTERACTIVE MESSAGE INTERFACE</li>
                  </ul>
                  <Button className="w-full hero-button font-pixel" size="lg" 
                          style={{ imageRendering: 'pixelated' }}>
                    ENTER CHAT 1
                  </Button>
                </CardContent>
              </Link>
            </Card>

            {/* Chat 2 Option */}
            <Card className="hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-primary/30 hover:border-primary/50 glass-card">
              <Link to="/chat2">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-accent to-primary rounded-xl flex items-center justify-center mx-auto mb-4 border-2 border-accent/50"
                       style={{ imageRendering: 'pixelated' }}>
                    <MessageSquare className="h-8 w-8 text-background" />
                  </div>
                  <CardTitle className="text-2xl font-pixel text-white" 
                             style={{ imageRendering: 'pixelated' }}>
                    CHAT 2
                  </CardTitle>
                  <CardDescription className="text-base font-pixel text-accent bg-black/40 px-4 py-2 rounded-lg border border-accent/20"
                                   style={{ imageRendering: 'pixelated' }}>
                    COMING SOON - ADVANCED CHAT FEATURES
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <ul className="text-sm font-pixel text-white space-y-2 mb-6 bg-black/40 px-4 py-4 rounded-lg border border-accent/20"
                      style={{ imageRendering: 'pixelated' }}>
                    <li>• ENHANCED AI CAPABILITIES</li>
                    <li>• ADDITIONAL VERIFICATION METHODS</li>
                    <li>• EXTENDED CONVERSATION FEATURES</li>
                    <li>• MORE CUSTOMIZATION OPTIONS</li>
                  </ul>
                  <Button className="w-full font-pixel border-2 border-accent hover:bg-accent/20 text-accent hover:text-white" 
                          size="lg" variant="outline" 
                          style={{ imageRendering: 'pixelated' }}>
                    EXPLORE CHAT 2
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