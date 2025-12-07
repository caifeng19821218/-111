import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Lightformer } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeState } from '../types';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { Star } from './Star';

interface SceneProps {
  treeState: TreeState;
}

export const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <Canvas dpr={[1, 2]}>
      <PerspectiveCamera makeDefault position={[0, 2, 18]} fov={45} />
      
      {/* Lighting Strategy: Dark, moody, cinematic with gold highlights */}
      <ambientLight intensity={0.2} color="#052e16" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2} 
        color="#fff5b6" 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#FFD700" />
      <pointLight position={[0, -5, 5]} intensity={0.5} color="#0B6623" />

      {/* Environment for shiny reflections on gold ornaments - Procedural to avoid external fetch errors */}
      <Environment resolution={512}>
        <group rotation={[-Math.PI / 4, -0.3, 0]}>
            {/* Top Light */}
            <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
            {/* Side Highlights for Rim Lighting */}
            <Lightformer intensity={4} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[10, 2, 1]} />
            <Lightformer intensity={4} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[10, 2, 1]} />
            <Lightformer intensity={4} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 2, 1]} />
            {/* Golden Overhead Accent */}
            <Lightformer form="ring" color="#FFD700" intensity={10} scale={2} position={[0, 10, 0]} onUpdate={(self) => self.lookAt(0, 0, 0)} />
        </group>
      </Environment>

      {/* Content */}
      <group position={[0, -5, 0]}>
        <Star treeState={treeState} />
        <Foliage treeState={treeState} />
        <Ornaments treeState={treeState} />
      </group>

      {/* Controls */}
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={30}
        autoRotate={treeState === TreeState.TREE_SHAPE}
        autoRotateSpeed={0.5}
      />

      {/* Cinematic Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.2} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.6}
        />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
      </EffectComposer>
    </Canvas>
  );
};