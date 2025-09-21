import { Canvas } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';
import { Mesh } from 'three';

interface ButtonProps {
  pressAmount: number;
  onClick: () => void;
}

const RedButton = ({ pressAmount, onClick }: ButtonProps) => {
  const buttonRef = useRef<Mesh>(null);
  const baseRef = useRef<Mesh>(null);
  
  // Calculate press depth (0 to 0.3)
  const pressDepth = Math.min(0.3, pressAmount * 0.3);
  
  return (
    <group onClick={onClick}>
      {/* Button base (darker red, stays in place) */}
      <mesh ref={baseRef} position={[0, -0.4, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.8, 32]} />
        <meshPhongMaterial color="#8B0000" />
      </mesh>
      
      {/* Button top (bright red, moves down when pressed) */}
      <mesh ref={buttonRef} position={[0, 0.1 - pressDepth, 0]}>
        <cylinderGeometry args={[1, 1, 0.6, 32]} />
        <meshPhongMaterial color="#FF0000" />
      </mesh>
      
      {/* Button highlight ring */}
      <mesh position={[0, 0.2 - pressDepth, 0]}>
        <torusGeometry args={[1, 0.05, 16, 100]} />
        <meshPhongMaterial color="#FF6666" />
      </mesh>
      
      {/* Text on button */}
      <mesh position={[0, 0.35 - pressDepth, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} />
      </mesh>
    </group>
  );
};

interface ScrollButton3DProps {
  scrollY: number;
  onClick: () => void;
}

const ScrollButton3D = ({ scrollY, onClick }: ScrollButton3DProps) => {
  // Calculate press amount based on scroll (0 to 1)
  const pressAmount = Math.min(1, scrollY / 200);
  
  return (
    <div className="w-32 h-32 cursor-pointer">
      <Canvas
        camera={{ position: [0, 2, 4], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1} 
          castShadow
        />
        <pointLight position={[-5, 5, 5]} intensity={0.5} />
        
        {/* 3D Button */}
        <RedButton pressAmount={pressAmount} onClick={onClick} />
      </Canvas>
    </div>
  );
};

export default ScrollButton3D;