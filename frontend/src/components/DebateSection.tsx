/**
 * DebateSection - Animated section with pixelated people debating
 * Features scroll-driven animations with about, tech stacks, and challenges
 */
import { useEffect, useRef } from 'react';

const DebateSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const techRef = useRef<HTMLDivElement>(null);
  const challengesRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (rafIdRef.current) return;
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        
        if (!sectionRef.current) return;
        
        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const sectionHeight = sectionRef.current.offsetHeight;
        
        // Calculate scroll progress through the section
        const scrolled = Math.max(0, -rect.top);
        const maxScroll = Math.max(1, sectionHeight - windowHeight);
        const progress = Math.min(1, Math.max(0, scrolled / maxScroll));
        
        // Animate subsections based on scroll progress (much earlier fade-in)
        const subsections = [aboutRef.current, techRef.current, challengesRef.current];
        
        subsections.forEach((section, index) => {
          if (!section) return;
          
          // Much earlier animation - start immediately when section is visible
          const sectionProgress = Math.max(0, Math.min(1, (progress + 0.1 - index * 0.05) * 8));
          const translateY = (1 - sectionProgress) * 20;
          const opacity = sectionProgress;
          
          section.style.transform = `translateY(${translateY}px)`;
          section.style.opacity = opacity.toString();
        });
        
        // Animate pixelated people based on scroll
        const people = sectionRef.current.querySelectorAll('.pixel-person');
        people.forEach((person, index) => {
          const element = person as HTMLElement;
          const personProgress = (progress + index * 0.1) % 1;
          
          // Create debate-like movements
          const bounce = Math.sin(personProgress * Math.PI * 4) * 10;
          const sway = Math.cos(personProgress * Math.PI * 6) * 5;
          
          element.style.transform = `translateY(${bounce}px) translateX(${sway}px) scale(${0.8 + personProgress * 0.4})`;
        });
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Initial call
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="min-h-[200vh] relative overflow-hidden"
      style={{ backgroundColor: '#0a1724' }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="debate-particle absolute w-2 h-2 bg-primary/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Pixelated People */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Left side debater */}
        <div 
          className="pixel-person absolute left-20 top-1/4 w-16 h-20 bg-gradient-to-b from-blue-400 to-blue-600 rounded-sm"
          style={{ 
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
            imageRendering: 'pixelated'
          }}
        >
          {/* Simple pixelated face */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-sm"></div>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-sm"></div>
        </div>

        {/* Right side debater */}
        <div 
          className="pixel-person absolute right-20 top-1/3 w-16 h-20 bg-gradient-to-b from-red-400 to-red-600 rounded-sm"
          style={{ 
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
            imageRendering: 'pixelated'
          }}
        >
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-sm"></div>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-sm"></div>
        </div>

        {/* Center mediator */}
        <div 
          className="pixel-person absolute left-1/2 -translate-x-1/2 top-1/2 w-16 h-20 bg-gradient-to-b from-green-400 to-green-600 rounded-sm"
          style={{ 
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
            imageRendering: 'pixelated'
          }}
        >
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-sm"></div>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-sm"></div>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center py-20">
        <div className="container mx-auto px-4 space-y-32">
          
          {/* About Section */}
          <div ref={aboutRef} className="text-center opacity-0 transform translate-y-12">
            <h2 className="text-5xl font-bold font-pixel text-white mb-8"
                style={{ 
                  textShadow: '4px 4px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
                  imageRendering: 'pixelated'
                }}>
              ABOUT THE PROJECT
            </h2>
            <div className="max-w-4xl mx-auto bg-black/60 p-8 rounded-xl border border-primary/30">
              <p className="text-lg text-white font-pixel leading-relaxed mb-6"
                 style={{ imageRendering: 'pixelated' }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
                nostrud exercitation ullamco laboris.
              </p>
              <p className="text-lg text-white font-pixel leading-relaxed"
                 style={{ imageRendering: 'pixelated' }}>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
                eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
              </p>
            </div>
          </div>

          {/* Tech Stack Section */}
          <div ref={techRef} className="text-center opacity-0 transform translate-y-12">
            <h2 className="text-5xl font-bold font-pixel text-white mb-8"
                style={{ 
                  textShadow: '4px 4px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
                  imageRendering: 'pixelated'
                }}>
              TECH STACK
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {['Frontend', 'Backend', 'Tools'].map((category, index) => (
                <div key={category} className="bg-black/60 p-6 rounded-xl border border-primary/30">
                  <h3 className="text-2xl font-pixel text-primary mb-4"
                      style={{ imageRendering: 'pixelated' }}>
                    {category}
                  </h3>
                  <ul className="space-y-2 text-white font-pixel"
                      style={{ imageRendering: 'pixelated' }}>
                    <li>• Technology A</li>
                    <li>• Technology B</li>
                    <li>• Technology C</li>
                    <li>• Technology D</li>
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Challenges Section */}
          <div ref={challengesRef} className="text-center opacity-0 transform translate-y-12">
            <h2 className="text-5xl font-bold font-pixel text-white mb-8"
                style={{ 
                  textShadow: '4px 4px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
                  imageRendering: 'pixelated'
                }}>
              CHALLENGES OVERCOME
            </h2>
            <div className="max-w-4xl mx-auto space-y-6">
              {[1, 2, 3].map((challenge) => (
                <div key={challenge} className="bg-black/60 p-6 rounded-xl border border-primary/30 text-left">
                  <h3 className="text-xl font-pixel text-primary mb-3"
                      style={{ imageRendering: 'pixelated' }}>
                    Challenge #{challenge}: Lorem Ipsum Problem
                  </h3>
                  <p className="text-white font-pixel"
                     style={{ imageRendering: 'pixelated' }}>
                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium 
                    doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore 
                    veritatis et quasi architecto beatae vitae dicta sunt.
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DebateSection;