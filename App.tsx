import React, { useState, Suspense } from 'react';
import { Scene } from './components/Scene';
import { UI } from './components/UI';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);

  const toggleState = () => {
    setTreeState((prev) =>
      prev === TreeState.TREE_SHAPE ? TreeState.SCATTERED : TreeState.TREE_SHAPE
    );
  };

  return (
    <div className="relative w-full h-screen bg-black">
      <Suspense fallback={<div className="text-gold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-xl tracking-widest text-[#FFD700]">LOADING ARIX SIGNATURE...</div>}>
        <Scene treeState={treeState} />
      </Suspense>
      <UI treeState={treeState} onToggle={toggleState} />
    </div>
  );
};

export default App;