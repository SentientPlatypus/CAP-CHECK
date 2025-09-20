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
      const pressDepth = isPressed ? -0.15 : 0;
      meshRef.current.position.z = pressDepth;
      
      // Add slight rotation based on scroll
      meshRef.current.rotation.x = Math.sin(scrollProgress * Math.PI) * 0.05;
      meshRef.current.rotation.y = scrollProgress * 0.1;
    }
  });

  const buttonHeight = isPressed ? 0.2 : 0.4;
  const buttonRadius = 1.2;

  return (
    <group ref={meshRef}>
      {/* Main button body - single raised cylinder */}
      <mesh position={[0, 0, buttonHeight / 2]}>
        <cylinderGeometry args={[buttonRadius, buttonRadius, buttonHeight, 64]} />
        <meshPhongMaterial 
          color="#dc2626" 
          shininess={30}
          specular="#ffffff"
        />
      </mesh>
      
      {/* Button top cap with slight bevel */}
      <mesh position={[0, 0, buttonHeight]}>
        <cylinderGeometry args={[buttonRadius - 0.05, buttonRadius, 0.1, 64]} />
        <meshPhongMaterial 
          color="#ef4444" 
          shininess={50}
          specular="#ffffff"
        />
      </mesh>
      
      {/* Button base/platform */}
      <mesh position={[0, 0, -0.15]}>
        <cylinderGeometry args={[buttonRadius + 0.3, buttonRadius + 0.3, 0.3, 64]} />
        <meshPhongMaterial color="#1f2937" />
      </mesh>
      
      {/* Subtle rim around base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[buttonRadius + 0.25, buttonRadius + 0.3, 0.05, 64]} />
        <meshPhongMaterial color="#374151" />
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