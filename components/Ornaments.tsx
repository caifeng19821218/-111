import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState, TREE_CONFIG, COLORS } from '../types';

interface OrnamentsProps {
  treeState: TreeState;
}

// Data structure for a single ornament instance
interface OrnamentData {
  treePos: THREE.Vector3;
  scatterPos: THREE.Vector3;
  rotationSpeed: THREE.Vector3;
  scale: number;
  type: 'bauble' | 'gift';
  color: THREE.Color;
}

export const Ornaments: React.FC<OrnamentsProps> = ({ treeState }) => {
  // We use two InstancedMeshes: one for Spheres (Baubles), one for Boxes (Gifts)
  const baubleMeshRef = useRef<THREE.InstancedMesh>(null);
  const giftMeshRef = useRef<THREE.InstancedMesh>(null);

  // Store layout data in state so it doesn't regenerate on re-renders
  const [data] = useState<{ baubles: OrnamentData[], gifts: OrnamentData[] }>(() => {
    const baubles: OrnamentData[] = [];
    const gifts: OrnamentData[] = [];
    
    const { height, radius, scatterRadius, ornamentCount } = TREE_CONFIG;
    const tempVec3 = new THREE.Vector3();

    for (let i = 0; i < ornamentCount; i++) {
      const isGift = Math.random() > 0.7; // 30% gifts, 70% baubles
      
      // --- Tree Position Calculation ---
      const yNorm = Math.random();
      const y = yNorm * height;
      const rAtHeight = (1 - yNorm) * radius * 0.9; // Slightly inside the foliage
      const theta = Math.random() * Math.PI * 2;
      
      const treePos = new THREE.Vector3(
        rAtHeight * Math.cos(theta),
        y,
        rAtHeight * Math.sin(theta)
      );

      // --- Scatter Position Calculation ---
      const u = Math.random();
      const v = Math.random();
      const phi = Math.acos(2 * u - 1);
      const lambda = 2 * Math.PI * v;
      const rad = Math.cbrt(Math.random()) * scatterRadius;
      
      const scatterPos = new THREE.Vector3(
        rad * Math.sin(phi) * Math.cos(lambda),
        rad * Math.sin(phi) * Math.sin(lambda) + height / 2,
        rad * Math.cos(phi)
      );

      const item: OrnamentData = {
        treePos,
        scatterPos,
        rotationSpeed: new THREE.Vector3(
          Math.random() - 0.5, 
          Math.random() - 0.5, 
          Math.random() - 0.5
        ),
        scale: Math.random() * 0.3 + 0.2,
        type: isGift ? 'gift' : 'bauble',
        // Palette: Mostly Gold, some Emerald, some White
        color: Math.random() > 0.5 
          ? new THREE.Color(COLORS.GOLD) 
          : Math.random() > 0.5 
            ? new THREE.Color(COLORS.GOLD_WARM) 
            : new THREE.Color(COLORS.EMERALD_LIGHT)
      };

      if (isGift) gifts.push(item);
      else baubles.push(item);
    }
    return { baubles, gifts };
  });

  // Reusable dummy object for matrix calculations
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const currentProgress = useRef(1); // 1 = Tree, 0 = Scatter

  // Color arrays for InstancedMesh
  useLayoutEffect(() => {
    if (baubleMeshRef.current) {
      data.baubles.forEach((item, i) => {
        baubleMeshRef.current!.setColorAt(i, item.color);
      });
      baubleMeshRef.current.instanceColor!.needsUpdate = true;
    }
    if (giftMeshRef.current) {
      data.gifts.forEach((item, i) => {
        giftMeshRef.current!.setColorAt(i, item.color);
      });
      giftMeshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [data]);

  useFrame((state, delta) => {
    const dest = treeState === TreeState.TREE_SHAPE ? 1 : 0;
    // Slower, heavy animation for ornaments compared to particles
    currentProgress.current = THREE.MathUtils.lerp(currentProgress.current, dest, delta * 0.8);
    const t = currentProgress.current;
    
    // Ease function for smooth physics
    // Using a simpler EaseInOutQuad
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const time = state.clock.elapsedTime;

    // Update Baubles
    if (baubleMeshRef.current) {
      data.baubles.forEach((item, i) => {
        // Position Morph
        dummy.position.lerpVectors(item.scatterPos, item.treePos, ease);
        
        // Add Floating wobble
        dummy.position.y += Math.sin(time + i) * 0.05 * (1 - ease); // Float more when scattered

        // Rotation
        dummy.rotation.set(
          time * item.rotationSpeed.x,
          time * item.rotationSpeed.y,
          time * item.rotationSpeed.z
        );
        
        dummy.scale.setScalar(item.scale * (0.8 + 0.2 * ease)); // Slightly smaller when scattered
        dummy.updateMatrix();
        baubleMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      baubleMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update Gifts
    if (giftMeshRef.current) {
      data.gifts.forEach((item, i) => {
        dummy.position.lerpVectors(item.scatterPos, item.treePos, ease);
        // Gifts float slower
        dummy.position.y += Math.sin(time * 0.5 + i) * 0.08 * (1 - ease);

        dummy.rotation.set(
          time * item.rotationSpeed.x * 0.5,
          time * item.rotationSpeed.y * 0.5,
          time * item.rotationSpeed.z * 0.5
        );
        
        dummy.scale.setScalar(item.scale * 1.2 * (0.8 + 0.2 * ease));
        dummy.updateMatrix();
        giftMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      giftMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Baubles Instanced Mesh */}
      <instancedMesh
        ref={baubleMeshRef}
        args={[undefined, undefined, data.baubles.length]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          metalness={1} 
          roughness={0.1} 
          envMapIntensity={1.5}
        />
      </instancedMesh>

      {/* Gifts Instanced Mesh */}
      <instancedMesh
        ref={giftMeshRef}
        args={[undefined, undefined, data.gifts.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          metalness={0.6} 
          roughness={0.2} 
          envMapIntensity={1}
        />
      </instancedMesh>
    </>
  );
};