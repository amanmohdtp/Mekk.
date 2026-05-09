import React, { useRef, useCallback } from 'react';
import Canvas from './components/Editor/Canvas';
import Toolbar from './components/Editor/Toolbar';
import Inspector from './components/Editor/Inspector';
import AIPanel from './components/Editor/AIPanel';
import LayersPanel from './components/Editor/LayersPanel';
import { useEditor } from './hooks/useEditor';
import { exportProject } from './utils/exportUtils';
import { Download } from 'lucide-react';

const Editor = () => {
  const canvasRef = useRef(null);
  const {
    activeTool,
    setTool,
    selectedItem,
    strokeColor,
    fillColor,
    strokeWidth,
    updateSelectedStyle,
    performBoolean,
    undo,
    redo,
    canUndo,
    canRedo,
    deleteSelected,
    applyAI,
    projectUpdated,
    paper
  } = useEditor(canvasRef);

  const handleExport = (format) => {
    exportProject(paper, format);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#1a1a1a' }}>
      <div className="header">
        <img src="/mekk_logo.png" alt="Mekk." className="logo" />
        
        <div className="dropdown">
          <button className="btn-export" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} />
            PRO EXPORT
          </button>
          <div className="dropdown-content">
            <button onClick={() => handleExport('png')}>PNG (300 DPI)</button>
            <button onClick={() => handleExport('jpg')}>JPG (300 DPI)</button>
            <button onClick={() => handleExport('svg')}>SVG (Vector)</button>
            <button onClick={() => handleExport('pdf')}>PDF (Document)</button>
          </div>
        </div>
      </div>

      <Toolbar 
        activeTool={activeTool}
        setTool={setTool}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onDelete={deleteSelected}
        onBoolean={performBoolean}
      />

      <Canvas canvasRef={canvasRef} />

      <AIPanel onApplyAI={applyAI} />
      
      <LayersPanel projectUpdated={projectUpdated} />

      <Inspector 
        selectedItem={selectedItem}
        strokeColor={strokeColor}
        fillColor={fillColor}
        strokeWidth={strokeWidth}
        onChange={updateSelectedStyle}
      />
    </div>
  );
};

export default Editor;
