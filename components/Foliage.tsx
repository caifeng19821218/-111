import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState, TREE_CONFIG, COLORS } from '../types';

interface FoliageProps {
  treeState: TreeState;
}

// Custom Shader for high performance morphing particles
const FoliageShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 1 }, // 0 = Scatter, 1 = Tree
    uColorBase: { value: new THREE.Color(COLORS.EMERALD) },
    uColorHighlight: { value: new THREE.Color(COLORS.GOLD) },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    attribute vec3 aPositionScatter;
    attribute vec3 aPositionTree;
    attribute float aRandom;
    attribute float aSize;
    
    varying float vAlpha;
    varying vec3 vColor;

    // Cubic easing for smooth transition
    float easeInOutCubic(float x) {
      return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }

    void main() {
      float t = easeInOutCubic(uProgress);
      
      // Interpolate position
      vec3 pos = mix(aPositionScatter, aPositionTree, t);

      // Add "Breathing" and "Wind" effect
      float wind = sin(uTime * 1.5 + pos.y * 0.5 + aRandom * 5.0) * 0.1;
      pos.x += wind;
      pos.z += wind * 0.5;

      // Add some noise to the scatter movement so they don't move in straight lines
      if (t < 1.0 && t > 0.0) {
        pos.y += sin(uTime * 5.0 + aRandom * 10.0) * (1.0 - t) * 0.5;
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // Size attenuation based on depth and random factor
      gl_PointSize = (aSize * (1.0 + sin(uTime * 2.0 + aRandom * 100.0) * 0.3)) * (200.0 / -mvPosition.z);

      // Varying for fragment
      vAlpha = 0.6 + 0.4 * sin(uTime + aRandom * 20.0); // Twinkle
    }
  `,
  fragmentShader: `
    uniform vec3 uColorBase;
    uniform vec3 uColorHighlight;
    varying float vAlpha;

    void main() {
      // Circular soft particle
      float r = distance(gl_PointCoord, vec2(0.5));
      if (r > 0.5) discard;

      // Soft edge glow
      float glow = 1.0 - (r * 2.0);
      glow = pow(glow, 1.5);

      vec3 finalColor = mix(uColorBase, uColorHighlight, glow * 0.5);
      
      gl_FragColor = vec4(finalColor, vAlpha * glow);
    }
  `
};

export const Foliage: React.FC<FoliageProps> = ({ treeState }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const targetProgress = useRef(1); // 1 = Tree, 0 = Scatter

  // Generate Geometry Data Once
  const { positionsTree, positionsScatter, randoms, sizes } = useMemo(() => {
    const count = TREE_CONFIG.particleCount;
    const posTree = new Float32Array(count * 3);
    const posScatter = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    const sz = new Float32Array(count);

    const { height, radius, scatterRadius } = TREE_CONFIG;

    for (let i = 0; i < count; i++) {
      // Tree Shape (Spiral Cone)
      // Normalize height 0 to 1
      const yNorm = Math.random(); 
      const y = yNorm * height;
      // Radius at this height
      const r = (1 - yNorm) * radius;
      // Spiral angle
      const theta = y * 5.0 + Math.random() * Math.PI * 2;
      
      // Add slight volume thickness
      const thickness = Math.random() * 0.5;
      
      posTree[i * 3] = (r + thickness) * Math.cos(theta);
      posTree[i * 3 + 1] = y;
      posTree[i * 3 + 2] = (r + thickness) * Math.sin(theta);

      // Scatter Shape (Sphere Random)
      const u = Math.random();
      const v = Math.random();
      const phi = Math.acos(2 * u - 1); // inclination
      const lambda = 2 * Math.PI * v; // azimuth
      const rad = Math.cbrt(Math.random()) * scatterRadius; // uniform sphere distribution

      posScatter[i * 3] = rad * Math.sin(phi) * Math.cos(lambda);
      posScatter[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(lambda) + height / 2; // offset center
      posScatter[i * 3 + 2] = rad * Math.cos(phi);

      // Attributes
      rnd[i] = Math.random();
      sz[i] = Math.random() * 0.4 + 0.1; // Base size
    }

    return {
      positionsTree: posTree,
      positionsScatter: posScatter,
      randoms: rnd,
      sizes: sz
    };
  }, []);

  useFrame((state, delta) => {
    if (!materialRef.current) return;

    // Logic: Determine target progress
    const dest = treeState === TreeState.TREE_SHAPE ? 1 : 0;
    
    // Smooth Lerp
    targetProgress.current = THREE.MathUtils.lerp(targetProgress.current, dest, delta * 1.5);

    // Update Uniforms
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uProgress.value = targetProgress.current;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // Threejs requires a position attribute even if we override it in shader usually, but we act like 'position' is tree for raycasting bounds (optional)
          array={positionsTree}
          count={positionsTree.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPositionTree"
          array={positionsTree}
          count={positionsTree.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPositionScatter"
          array={positionsScatter}
          count={positionsScatter.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          array={randoms}
          count={randoms.length}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSize"
          array={sizes}
          count={sizes.length}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        attach="material"
        args={[FoliageShaderMaterial]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};