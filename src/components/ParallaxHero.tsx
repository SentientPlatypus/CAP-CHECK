import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

const SECTION_HEIGHT = 1500;

const ParallaxHero = () => {
  return (
    <div className="bg-background">
      <Hero />
      <ParallaxImages />
    </div>
  );
};

const Hero = () => {
  return (
    <div
      style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
      className="relative w-full"
    >
      <CenterImage />
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-background/0 to-background" />
    </div>
  );
};

const CenterImage = () => {
  const { scrollY } = useScroll();

  const clip1 = useTransform(scrollY, [0, 1500], [40, 0]);
  const clip2 = useTransform(scrollY, [0, 1500], [60, 100]);

  const clipPath = useMotionTemplate`polygon(${clip1}% ${clip1}%, ${clip2}% ${clip1}%, ${clip2}% ${clip2}%, ${clip1}% ${clip2}%)`;

  const scale = useTransform(
    scrollY,
    [0, SECTION_HEIGHT],
    [0.7, 1.2] // Start bigger (0.7 instead of 0.3), grow more
  );
  
  const opacity = useTransform(
    scrollY,
    [SECTION_HEIGHT + 800, SECTION_HEIGHT + 1200], // Stay visible longer
    [1, 0]
  );

  return (
    <motion.div
      className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden"
      style={{
        clipPath,
        opacity,
      }}
    >
      <motion.div
        className="w-full h-full relative flex"
        style={{
          scale,
          background: `
            radial-gradient(circle at 30% 40%, hsl(15, 85%, 65%, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, hsl(25, 90%, 70%, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, hsl(220, 26%, 4%) 0%, hsl(220, 26%, 8%) 100%)
          `
        }}
      >
        {/* Phone side */}
        <div className="w-1/2 h-full flex items-center justify-center">
          <div className="relative">
            <div className="w-48 h-96 bg-gradient-to-br from-purple-600 to-purple-800 rounded-[2.5rem] border-4 border-white/20 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
              {/* Phone notch */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-2 bg-black rounded-full"></div>
              
              {/* Phone content */}
              <div className="flex flex-col items-center justify-center h-full px-6">
                <div className="text-6xl mb-8">⚡</div>
                <div className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold text-sm">
                  Get Started
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Text side */}
        <div className="w-1/2 h-full flex items-center justify-start pl-12">
          <div className="text-left">
            <h1 className="text-8xl font-bold text-purple-500 mb-6">
              Interactive
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg mb-8">
              Experience AI-powered fact-checking technology that detects lies and verifies truth in real-time conversations.
            </p>
            <div className="flex gap-4">
              <div className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium">
                CAP CHECK ⌄
              </div>
              <div className="text-muted-foreground px-6 py-3 font-medium">
                View Gallery ⌄
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ParallaxImages = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-[200px]">
      <ParallaxImg
        src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3"
        alt="Tech interface"
        start={-200}
        end={200}
        className="w-1/3"
      />
      <ParallaxImg
        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3"
        alt="Data visualization"
        start={200}
        end={-250}
        className="mx-auto w-2/3"
      />
      <ParallaxImg
        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3"
        alt="Analytics dashboard"
        start={-200}
        end={200}
        className="ml-auto w-1/3"
      />
      <ParallaxImg
        src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3"
        alt="AI technology"
        start={0}
        end={-500}
        className="ml-24 w-5/12"
      />
      <ParallaxImg
        src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3"
        alt="Circuit board"
        start={150}
        end={-150}
        className="mr-24 w-1/2"
      />
      <ParallaxImg
        src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3"
        alt="Digital interface"
        start={-100}
        end={300}
        className="w-2/5"
      />
    </div>
  );
};

interface ParallaxImgProps {
  className: string;
  alt: string;
  src: string;
  start: number;
  end: number;
}

const ParallaxImg = ({ className, alt, src, start, end }: ParallaxImgProps) => {
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
      className={`${className} rounded-xl shadow-lg mb-12`}
      ref={ref}
      style={{ transform, opacity }}
      loading="lazy"
    />
  );
};

export default ParallaxHero;