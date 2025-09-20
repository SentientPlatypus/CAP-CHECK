import { Canvas } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';

interface PixelButton3DProps {
  isPressed: boolean;
  scrollProgress: number;
}

const PixelatedButton = ({ isPressed, scrollProgress }: { isPressed: boolean; scrollProgress: number }) => {
  const meshRef = useRef<Group>(null);
  
  // Create pixelated button geometry using small cubes
  const cubes = useMemo(() => {
    const cubeData = [];
    const size = 8; // 8x8 pixel button
    const pixelSize = 0.2;
    
    // Create button pattern (red button with darker edges)
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const isEdge = x === 0 || x === size - 1 || y === 0 || y === size - 1;
        const isCorner = (x === 0 || x === size - 1) && (y === 0 || y === size - 1);
        
        let color = '#ef4444'; // Red
        if (isCorner) color = '#7f1d1d'; // Dark red corners
        else if (isEdge) color = '#dc2626'; // Darker red edges
        
        cubeData.push({
          position: [(x - size/2) * pixelSize, (y - size/2) * pixelSize, 0],
          color,
        });
      }
    }
    return cubeData;
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      // Animate the button press
      const pressDepth = isPressed ? -0.3 : 0;
      meshRef.current.position.z = pressDepth;
      
      // Add slight rotation based on scroll
      meshRef.current.rotation.y = scrollProgress * 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      {cubes.map((cube, index) => (
        <mesh key={index} position={cube.position}>
          <boxGeometry args={[0.18, 0.18, isPressed ? 0.1 : 0.3]} />
          <meshBasicMaterial color={cube.color} />
        </mesh>
      ))}
      
      {/* Button base/shadow */}
      <mesh position={[0, 0, -0.4]}>
        <boxGeometry args={[1.8, 1.8, 0.2]} />
        <meshBasicMaterial color="#4a4a4a" />
      </mesh>
    </group>
  );
};

const PixelButton3D = ({ isPressed, scrollProgress }: PixelButton3DProps) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <PixelatedButton isPressed={isPressed} scrollProgress={scrollProgress} />
      </Canvas>
      
      {/* 8-bit style text overlay */}
      <div 
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white font-mono text-lg font-bold"
        style={{ 
          textShadow: '2px 2px 0px #000000',
          fontFamily: 'monospace',
          imageRendering: 'pixelated'
        }}
      >
        {isPressed ? 'PRESSED!' : 'SCROLL DOWN'}
      </div>
    </div>
  );
};

export default PixelButton3D;