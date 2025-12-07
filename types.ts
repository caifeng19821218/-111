import { ThreeElements } from '@react-three/fiber';

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface Coordinates3D {
  x: number;
  y: number;
  z: number;
}

export const COLORS = {
  EMERALD: '#023020',
  EMERALD_LIGHT: '#0B6623',
  GOLD: '#FFD700',
  GOLD_WARM: '#C5A000',
  BG_DARK: '#000502',
};

// Configuration for the tree dimensions
export const TREE_CONFIG = {
  height: 12,
  radius: 4.5,
  particleCount: 16000,
  ornamentCount: 220,
  scatterRadius: 25,
};

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}