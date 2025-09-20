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

  useFrame(() => {
    if (meshRef.current) {
      // Animate the button press by moving it down
      const pressDepth = isPressed ? -0.1 : 0;
      meshRef.current.position.z = pressDepth;
      
      // Add subtle rotation based on scroll
      meshRef.current.rotation.y = scrollProgress * 0.1;
    }
  });

  const buttonHeight = isPressed ? 0.2 : 0.35;

  return (
    <group ref={meshRef}>
      {/* Main red button - ellipsoid shape */}
      <mesh position={[0, 0, buttonHeight / 2]} scale={[1.2, 0.8, 1]}>
        <sphereGeometry args={[0.8, 32, 16]} />
        <meshPhongMaterial 
          color="#dc2626" 
          shininess={20}
          specular="#ffffff"
        />
      </mesh>
      
      {/* Button highlight on top */}
      <mesh position={[0.2, 0.15, buttonHeight + 0.1]} scale={[0.6, 0.4, 0.3]}>
        <sphereGeometry args={[0.3, 16, 8]} />
        <meshBasicMaterial 
          color="#fca5a5" 
          transparent 
          opacity={0.7}
        />
      </mesh>
      
      {/* Grey base platform - elliptical */}
      <mesh position={[0, 0, -0.15]} scale={[1.6, 1.2, 1]}>
        <cylinderGeometry args={[0.8, 0.9, 0.3, 32]} />
        <meshPhongMaterial color="#9ca3af" />
      </mesh>
      
      {/* Base highlight ring */}
      <mesh position={[0, 0, -0.05]} scale={[1.5, 1.1, 1]}>
        <torusGeometry args={[0.75, 0.05, 16, 32]} />
        <meshPhongMaterial color="#d1d5db" />
      </mesh>
      
      {/* Base shadow ring */}
      <mesh position={[0, 0, -0.25]} scale={[1.7, 1.3, 1]}>
        <torusGeometry args={[0.8, 0.03, 16, 32]} />
        <meshLambertMaterial color="#6b7280" />
      </mesh>
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