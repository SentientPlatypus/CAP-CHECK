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

  // Create the exact pixelated button pattern from the reference image
  const pixels = useMemo(() => {
    const pixelData = [];
    const pixelSize = 0.12;
    
    // Red button top pattern (oval shape)
    const redPattern = [
      // Row by row, creating the oval red button top
      { x: -2, y: 3, color: '#dc2626' }, { x: -1, y: 3, color: '#dc2626' }, { x: 0, y: 3, color: '#dc2626' }, { x: 1, y: 3, color: '#dc2626' }, { x: 2, y: 3, color: '#dc2626' },
      { x: -3, y: 2, color: '#dc2626' }, { x: -2, y: 2, color: '#ef4444' }, { x: -1, y: 2, color: '#ef4444' }, { x: 0, y: 2, color: '#f87171' }, { x: 1, y: 2, color: '#ef4444' }, { x: 2, y: 2, color: '#ef4444' }, { x: 3, y: 2, color: '#dc2626' },
      { x: -4, y: 1, color: '#dc2626' }, { x: -3, y: 1, color: '#ef4444' }, { x: -2, y: 1, color: '#f87171' }, { x: -1, y: 1, color: '#fca5a5' }, { x: 0, y: 1, color: '#fca5a5' }, { x: 1, y: 1, color: '#f87171' }, { x: 2, y: 1, color: '#ef4444' }, { x: 3, y: 1, color: '#ef4444' }, { x: 4, y: 1, color: '#dc2626' },
      { x: -4, y: 0, color: '#dc2626' }, { x: -3, y: 0, color: '#ef4444' }, { x: -2, y: 0, color: '#f87171' }, { x: -1, y: 0, color: '#f87171' }, { x: 0, y: 0, color: '#f87171' }, { x: 1, y: 0, color: '#f87171' }, { x: 2, y: 0, color: '#ef4444' }, { x: 3, y: 0, color: '#ef4444' }, { x: 4, y: 0, color: '#dc2626' },
      { x: -4, y: -1, color: '#dc2626' }, { x: -3, y: -1, color: '#dc2626' }, { x: -2, y: -1, color: '#ef4444' }, { x: -1, y: -1, color: '#ef4444' }, { x: 0, y: -1, color: '#ef4444' }, { x: 1, y: -1, color: '#ef4444' }, { x: 2, y: -1, color: '#dc2626' }, { x: 3, y: -1, color: '#dc2626' }, { x: 4, y: -1, color: '#dc2626' },
      { x: -3, y: -2, color: '#dc2626' }, { x: -2, y: -2, color: '#dc2626' }, { x: -1, y: -2, color: '#dc2626' }, { x: 0, y: -2, color: '#dc2626' }, { x: 1, y: -2, color: '#dc2626' }, { x: 2, y: -2, color: '#dc2626' }, { x: 3, y: -2, color: '#dc2626' },
      { x: -2, y: -3, color: '#dc2626' }, { x: -1, y: -3, color: '#dc2626' }, { x: 0, y: -3, color: '#dc2626' }, { x: 1, y: -3, color: '#dc2626' }, { x: 2, y: -3, color: '#dc2626' }
    ];

    // Grey base pattern (wider oval)
    const greyPattern = [
      { x: -3, y: -3, color: '#9ca3af', z: -0.3 }, { x: -2, y: -3, color: '#9ca3af', z: -0.3 }, { x: -1, y: -3, color: '#d1d5db', z: -0.3 }, { x: 0, y: -3, color: '#d1d5db', z: -0.3 }, { x: 1, y: -3, color: '#d1d5db', z: -0.3 }, { x: 2, y: -3, color: '#9ca3af', z: -0.3 }, { x: 3, y: -3, color: '#9ca3af', z: -0.3 },
      { x: -4, y: -4, color: '#9ca3af', z: -0.3 }, { x: -3, y: -4, color: '#d1d5db', z: -0.3 }, { x: -2, y: -4, color: '#e5e7eb', z: -0.3 }, { x: -1, y: -4, color: '#e5e7eb', z: -0.3 }, { x: 0, y: -4, color: '#e5e7eb', z: -0.3 }, { x: 1, y: -4, color: '#e5e7eb', z: -0.3 }, { x: 2, y: -4, color: '#d1d5db', z: -0.3 }, { x: 3, y: -4, color: '#d1d5db', z: -0.3 }, { x: 4, y: -4, color: '#9ca3af', z: -0.3 },
      { x: -5, y: -5, color: '#6b7280', z: -0.3 }, { x: -4, y: -5, color: '#9ca3af', z: -0.3 }, { x: -3, y: -5, color: '#d1d5db', z: -0.3 }, { x: -2, y: -5, color: '#d1d5db', z: -0.3 }, { x: -1, y: -5, color: '#d1d5db', z: -0.3 }, { x: 0, y: -5, color: '#d1d5db', z: -0.3 }, { x: 1, y: -5, color: '#d1d5db', z: -0.3 }, { x: 2, y: -5, color: '#d1d5db', z: -0.3 }, { x: 3, y: -5, color: '#9ca3af', z: -0.3 }, { x: 4, y: -5, color: '#9ca3af', z: -0.3 }, { x: 5, y: -5, color: '#6b7280', z: -0.3 },
      { x: -4, y: -6, color: '#6b7280', z: -0.3 }, { x: -3, y: -6, color: '#6b7280', z: -0.3 }, { x: -2, y: -6, color: '#9ca3af', z: -0.3 }, { x: -1, y: -6, color: '#9ca3af', z: -0.3 }, { x: 0, y: -6, color: '#9ca3af', z: -0.3 }, { x: 1, y: -6, color: '#9ca3af', z: -0.3 }, { x: 2, y: -6, color: '#9ca3af', z: -0.3 }, { x: 3, y: -6, color: '#6b7280', z: -0.3 }, { x: 4, y: -6, color: '#6b7280', z: -0.3 }
    ];

    // Add red button pixels (elevated when not pressed)
    redPattern.forEach(pixel => {
      pixelData.push({
        position: [pixel.x * pixelSize, pixel.y * pixelSize, isPressed ? 0.05 : 0.15],
        color: pixel.color,
        height: isPressed ? 0.1 : 0.3
      });
    });

    // Add grey base pixels
    greyPattern.forEach(pixel => {
      pixelData.push({
        position: [pixel.x * pixelSize, pixel.y * pixelSize, pixel.z || -0.15],
        color: pixel.color,
        height: 0.2
      });
    });

    return pixelData;
  }, [isPressed]);

  useFrame(() => {
    if (meshRef.current) {
      // Animate the button press by moving it down slightly
      const pressDepth = isPressed ? -0.05 : 0;
      meshRef.current.position.z = pressDepth;
      
      // Add subtle rotation based on scroll
      meshRef.current.rotation.y = scrollProgress * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      {pixels.map((pixel, index) => (
        <mesh key={index} position={pixel.position}>
          <boxGeometry args={[0.11, 0.11, pixel.height]} />
          <meshLambertMaterial color={pixel.color} />
        </mesh>
      ))}
    </group>
  );
};

const PixelButton3D = ({ isPressed, scrollProgress }: PixelButton3DProps) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.8} 
          castShadow
        />
        <directionalLight 
          position={[-2, -2, 2]} 
          intensity={0.2} 
          color="#ff4444" 
        />
        <PixelatedButton isPressed={isPressed} scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
};

export default PixelButton3D;