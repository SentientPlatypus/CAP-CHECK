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
    const size = 12; // 12x12 pixel button for better roundness
    const pixelSize = 0.15;
    const center = size / 2;
    
    // Create round button pattern
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - center + 0.5, 2) + Math.pow(y - center + 0.5, 2)
        );
        
        // Only create cubes within circular boundary
        if (distanceFromCenter <= center - 0.5) {
          const normalizedDistance = distanceFromCenter / (center - 0.5);
          
          // Create gradient effect from center to edge
          let color = '#ef4444'; // Bright red center
          if (normalizedDistance > 0.8) color = '#b91c1c'; // Dark red edge
          else if (normalizedDistance > 0.6) color = '#dc2626'; // Medium red
          else if (normalizedDistance > 0.4) color = '#f87171'; // Light red
          else color = '#fca5a5'; // Lightest red center highlight
          
          const height = isPressed ? 0.1 : (0.4 - normalizedDistance * 0.2); // Varying heights for 3D effect
          
          cubeData.push({
            position: [(x - center) * pixelSize, (y - center) * pixelSize, height / 2],
            color,
            height,
          });
        }
      }
    }
    return cubeData;
  }, [isPressed]);

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
          <boxGeometry args={[0.14, 0.14, cube.height]} />
          <meshLambertMaterial color={cube.color} />
        </mesh>
      ))}
      
      {/* Circular button base/shadow */}
      <mesh position={[0, 0, -0.5]}>
        <cylinderGeometry args={[1.2, 1.4, 0.3, 32]} />
        <meshLambertMaterial color="#1f2937" />
      </mesh>
      
      {/* Glossy highlight effect when not pressed */}
      {!isPressed && (
        <mesh position={[0.3, 0.3, 0.2]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      )}
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
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-5, -5, 2]} intensity={0.3} color="#ff6b6b" />
        <PixelatedButton isPressed={isPressed} scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
};

export default PixelButton3D;