/**
 * Index Page - SpaceX-style Landing with Fixed Background
 * 
 * Features a fixed background image that zooms out as you scroll,
 * with content overlaid on top using clip path effects.
 */
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
import HeroSection from '@/components/HeroSection';
import ImageCarousel from '@/components/ImageCarousel';
import { Button } from '@/components/ui/button';
import ScrollPhone from '@/components/ScrollPhone';

const SECTION_HEIGHT = 1500;

const Index = () => {
  const { scrollY } = useScroll();
  const [showOverlay, setShowOverlay] = useState(false);

  // Clip path animation - starts small and expands as you scroll
  const clip1 = useTransform(scrollY, [0, SECTION_HEIGHT], [25, 0]);
  const clip2 = useTransform(scrollY, [0, SECTION_HEIGHT], [75, 100]);
  const clipPath = useMotionTemplate`polygon(${clip1}% ${clip1}%, ${clip2}% ${clip1}%, ${clip2}% ${clip2}%, ${clip1}% ${clip2}%)`;

  // Background size - starts normal and zooms in as you scroll
  const backgroundSize = useTransform(
    scrollY,
    [0, SECTION_HEIGHT + 500],
    ["100%", "170%"]
  );

  // Opacity for background fade out
  const backgroundOpacity = useTransform(
    scrollY,
    [SECTION_HEIGHT, SECTION_HEIGHT + 500],
    [1, 0]
  );

  // Overlay content scales in sync with background zoom
  const overlayScale = useTransform(scrollY, [0, SECTION_HEIGHT + 500], [1, 1.2]);

  // Show overlay content when past initial section
  useEffect(() => {
    const handleScroll = () => {
      const progress = window.scrollY / window.innerHeight;
      setShowOverlay(progress > 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-background">
      {/* Fixed Background Hero Image */}
      <motion.div
        className="fixed top-0 left-0 w-full h-screen z-10"
        style={{
          clipPath,
          backgroundSize,
          opacity: backgroundOpacity,
          backgroundImage: "url(https://images.unsplash.com/photo-1460186136353-977e9d6085a1?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay content on the fixed background */}
        <motion.div
          className="absolute inset-0 flex items-center"
          style={{ scale: overlayScale, transformOrigin: 'center' }}
        >
          <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 items-center gap-8">
            {/* Left side - Phone */}
            <div className="flex justify-center">
              <ScrollPhone scrollProgress={0} />
            </div>

            {/* Right side - Text */}
            <div className="text-left">
              <h1
                className="font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                style={{ fontSize: 'clamp(2rem, 8vw, 5rem)' }}
              >
                Interactive
              </h1>
              <p className="text-lg md:text-xl text-foreground/80 max-w-xl mb-8">
                Experience AI-powered fact-checking technology that detects lies and verifies truth in real-time conversations.
              </p>
              <div className="flex gap-4">
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium shadow-lg transition hover:opacity-90">
                  CAP CHECK ⌄
                </button>
                <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium border border-border transition hover:opacity-90">
                  View Gallery ⌄
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main content that scrolls over the fixed background */}
      <div 
        style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
        className="relative w-full"
      >
        {/* Spacer for the initial view */}
        <div className="h-screen" />
        
        {/* Parallax Images */}
        <ParallaxImages />
        
        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-transparent to-background z-20" />
      </div>

      {/* Regular content sections */}
      <div className="relative z-30 bg-background">
        {showOverlay && <HeroSection showOverlay={false} />}
        <ImageCarousel />
        
        {/* Call to Action Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Ready to Experience Real-time Communication?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Try our AI-powered chat interface with built-in fact-checking and verification system.
            </p>
            <Link to="/chat-select">
              <Button size="lg" className="gap-2">
                Choose Chat Experience
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

// Parallax Images Component
const ParallaxImages = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-[200px] relative z-20">
      <ParallaxImg
        src="https://images.unsplash.com/photo-1484600899469-230e8d1d59c0?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Space technology example"
        start={-200}
        end={200}
        className="w-1/3"
      />
      <ParallaxImg
        src="https://images.unsplash.com/photo-1446776709462-d6b525c57bd3?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="AI technology visualization"
        start={200}
        end={-250}
        className="mx-auto w-2/3"
      />
      <ParallaxImg
        src="https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Digital communication"
        start={-200}
        end={200}
        className="ml-auto w-1/3"
      />
      <ParallaxImg
        src="https://images.unsplash.com/photo-1494022299300-899b96e49893?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Interactive technology"
        start={0}
        end={-500}
        className="ml-24 w-5/12"
      />
    </div>
  );
};

// Individual Parallax Image Component
const ParallaxImg = ({ className, alt, src, start, end }: {
  className: string;
  alt: string;
  src: string;
  start: number;
  end: number;
}) => {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`${start}px end`, `end ${end * -1}px`],
  });

  const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.75, 1], [1, 0.85]);

  const y = useTransform(scrollYProgress, [0, 1], [start, end]);
  const transform = useMotionTemplate`translateY(${y}px) scale(${scale})`;

  return (
    <motion.img
      src={src}
      alt={alt}
      className={`${className} rounded-xl shadow-2xl mb-12`}
      ref={ref}
      style={{ transform, opacity }}
    />
  );
};

export default Index;