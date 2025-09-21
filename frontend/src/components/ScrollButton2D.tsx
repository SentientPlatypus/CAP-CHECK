interface ScrollButton2DProps {
  scrollY: number;
}

const ScrollButton2D = ({ scrollY }: ScrollButton2DProps) => {
  // Calculate press amount based on scroll (0 to 1)
  const pressAmount = Math.min(1, scrollY / 150);
  const pressDepth = pressAmount * 25; // Max 25px press down
  
  return (
    <div 
      className="relative w-24 h-24"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Fixed Base Platform */}
      <div 
        className="absolute bg-gray-800 border-4 border-gray-900 rounded-2xl"
        style={{
          width: '80px',
          height: '24px',
          bottom: '0px',
          left: '4px',
          imageRendering: 'pixelated',
          zIndex: 20
        }}
      />
      
      {/* Base Platform Top Surface */}
      <div 
        className="absolute bg-gray-600 rounded-xl"
        style={{
          width: '72px',
          height: '8px',
          bottom: '12px',
          left: '8px',
          imageRendering: 'pixelated',
          zIndex: 21
        }}
      />
      
      {/* Button (starts lower, squishes into base) */}
      <div 
        className="absolute bg-red-500 border-4 border-red-700 rounded-xl transition-all duration-200 ease-out"
        style={{
          width: '56px',
          height: `${56 - pressDepth}px`, // Squishes as it goes down
          top: `${32 + pressDepth}px`, // Starts lower, moves down more
          left: '16px',
          transform: 'translateZ(0)', // Hardware acceleration
          imageRendering: 'pixelated',
          zIndex: 10
        }}
      >
        {/* Button Highlight */}
        <div 
          className="absolute bg-red-300 rounded-lg"
          style={{
            width: '16px',
            height: '16px',
            top: '4px',
            left: '4px',
            opacity: Math.max(0.2, 1 - pressAmount * 0.6),
            imageRendering: 'pixelated'
          }}
        />
        
        {/* Button Shadow */}
        <div 
          className="absolute bg-red-800 rounded-lg"
          style={{
            width: '12px',
            height: '12px',
            bottom: '4px',
            right: '4px',
            opacity: Math.max(0.3, 0.8 - pressAmount * 0.4),
            imageRendering: 'pixelated'
          }}
        />
      </div>
      
      {/* Pressure Effect - Perfectly centered on button */}
      {pressAmount > 0.2 && (
        <div 
          className="absolute border-2 border-red-400 rounded-full animate-pulse"
          style={{
            width: `${80 + pressAmount * 16}px`,
            height: `${80 + pressAmount * 16}px`,
            top: `${20 + pressAmount * 4.5}px`, // Centers on button's changing position
            left: `${4 - pressAmount * 8}px`, // Centers on button's width
            opacity: pressAmount * 0.4,
            imageRendering: 'pixelated',
            zIndex: 5
          }}
        />
      )}
    </div>
  );
};

export default ScrollButton2D;