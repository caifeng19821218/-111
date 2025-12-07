import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState, TREE_CONFIG, COLORS } from '../types';

interface StarProps {
  treeState: TreeState;
}

export const Star: React.FC<StarProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  // Calculate positions
  const { treePos, scatterPos } = useMemo(() => {
    // Top of the tree
    const tPos = new THREE.Vector3(0, TREE_CONFIG.height, 0);
    
    // Random high position for scatter
    const sPos = new THREE.Vector3(
      (Math.random() - 0.5) * 10,
      TREE_CONFIG.height + 5 + Math.random() * 5,
      (Math.random() - 0.5) * 10
    );

    return { treePos: tPos, scatterPos: sPos };
  }, []);

  // Create Star Shape
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 1.2;
    const innerRadius = 0.55;
    const points = 5;

    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const a = (i / (points * 2)) * Math.PI * 2;
      // Rotate -PI/2 to have the top point pointing up in 2D shape space
      const x = Math.cos(a - Math.PI / 2) * r;
      const y = Math.sin(a - Math.PI / 2) * r;
      
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.15,
      bevelThickness: 0.15,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    return geo;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // 1. Position Lerp
    const targetPos = treeState === TreeState.TREE_SHAPE ? treePos : scatterPos;
    meshRef.current.position.lerp(targetPos, delta * 2);

    // 2. Continuous Rotation
    // Spin faster when scattered
    const spinSpeed = treeState === TreeState.TREE_SHAPE ? 0.5 : 0.2;
    meshRef.current.rotation.y += delta * spinSpeed;
    
    // Add a gentle floating bob
    meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.005;

    // 3. Light Pulse
    if (lightRef.current) {
      // Gentle pulsating glow
      lightRef.current.intensity = 2.5 + Math.sin(state.clock.elapsedTime * 3) * 0.5;
    }
  });

  return (
    <group>
      <mesh 
        ref={meshRef}
        geometry={starGeometry}
        castShadow
      >
        <meshStandardMaterial 
          color={COLORS.GOLD} 
          emissive={COLORS.GOLD}
          emissiveIntensity={2} // High intensity for bloom
          metalness={1.0}
          roughness={0.1}
        />
        <pointLight 
          ref={lightRef} 
          distance={15} 
          color={COLORS.GOLD} 
          decay={2} 
        />
      </mesh>
    </group>
  );
};