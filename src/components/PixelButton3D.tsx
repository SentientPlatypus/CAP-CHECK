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
      const pressDepth = isPressed ? -0.2 : 0;
      meshRef.current.position.z = pressDepth;
      
      // Add slight rotation based on scroll
      meshRef.current.rotation.y = scrollProgress * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Main button body - raised cylinder */}
      <mesh position={[0, 0, isPressed ? 0.1 : 0.3]}>
        <cylinderGeometry args={[1.5, 1.5, isPressed ? 0.2 : 0.6, 32]} />
        <meshLambertMaterial color="#dc2626" />
      </mesh>
      
      {/* Button top surface - slightly smaller for beveled effect */}
      <mesh position={[0, 0, isPressed ? 0.2 : 0.6]}>
        <cylinderGeometry args={[1.4, 1.4, 0.05, 32]} />
        <meshLambertMaterial color="#ef4444" />
      </mesh>
      
      {/* Highlight ring on top edge */}
      <mesh position={[0, 0, isPressed ? 0.22 : 0.62]}>
        <torusGeometry args={[1.4, 0.05, 16, 32]} />
        <meshLambertMaterial color="#f87171" />
      </mesh>
      
      {/* Button base/platform */}
      <mesh position={[0, 0, -0.2]}>
        <cylinderGeometry args={[1.8, 1.8, 0.3, 32]} />
        <meshLambertMaterial color="#374151" />
      </mesh>
      
      {/* Shadow ring around base */}
      <mesh position={[0, 0, -0.1]}>
        <torusGeometry args={[1.8, 0.1, 16, 32]} />
        <meshLambertMaterial color="#1f2937" />
      </mesh>
      
      {/* Glossy highlight when not pressed */}
      {!isPressed && (
        <mesh position={[0.4, 0.4, 0.7]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
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