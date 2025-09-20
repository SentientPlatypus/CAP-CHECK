import { motion } from "framer-motion";

interface ScrollButtonProps {
  scrollProgress: number;
}

const ScrollButton = ({ scrollProgress }: ScrollButtonProps) => {
  // Convert scroll progress to animation values
  const scale = 1 + (scrollProgress * 0.2); // Scale from 1 to 1.2
  const rotateY = scrollProgress * 15; // Rotate up to 15 degrees
  const brightness = 1 - (scrollProgress * 0.3); // Dim slightly as we scroll
  
  return (
    <div className="grid place-content-center p-12">
      <motion.button
        style={{
          transform: `scale(${scale}) rotateY(${rotateY}deg)`,
          filter: `brightness(${brightness})`,
        }}
        className="
          relative w-64 h-64 rounded-full
          bg-gradient-to-br from-red-500 via-red-600 to-red-700
          shadow-2xl shadow-red-500/30
          border-8 border-red-400/50
          hover:shadow-red-500/50
          transition-all duration-300
          flex items-center justify-center
          text-white font-bold text-2xl
          active:scale-95
          hover:scale-105
        "
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Button highlight */}
        <div className="absolute top-8 left-12 w-16 h-8 bg-white/30 rounded-full blur-md" />
        
        {/* Button text */}
        <span className="z-10 text-shadow-lg">
          PRESS ME
        </span>
        
        {/* Subtle inner shadow */}
        <div className="absolute inset-4 rounded-full border border-red-300/20" />
      </motion.button>
    </div>
  );
};

export default ScrollButton;