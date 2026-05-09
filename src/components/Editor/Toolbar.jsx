import React from 'react';
import { 
  MousePointer2, 
  PenTool, 
  Square, 
  Circle, 
  ArrowUpRight, 
  Undo2, 
  Redo2, 
  Trash2,
  Combine,
  Scissors,
  BoxSelect,
  MoveDiagonal
} from 'lucide-react';

const Toolbar = ({ 
  activeTool, 
  setTool, 
  undo, 
  redo, 
  canUndo, 
  canRedo,
  onDelete,
  onBoolean
}) => {
  const tools = [
    { id: 'select', icon: <MousePointer2 size={20} />, label: 'Selection' },
    { id: 'pen', icon: <PenTool size={20} />, label: 'Pen' },
    { id: 'rect', icon: <Square size={20} />, label: 'Rectangle' },
    { id: 'circle', icon: <Circle size={20} />, label: 'Ellipse' },
    { id: 'line', icon: <ArrowUpRight size={20} />, label: 'Line' },
    { id: 'transform', icon: <MoveDiagonal size={20} />, label: 'Scale / Rotate' },
  ];

  const booleanOps = [
    { id: 'unite', icon: <Combine size={20} />, label: 'Unite' },
    { id: 'subtract', icon: <Scissors size={20} />, label: 'Subtract' },
    { id: 'intersect', icon: <BoxSelect size={20} />, label: 'Intersect' },
  ];

  return (
    <div className="toolbar flex-col gap-4">
      <div className="bg-panel p-2 rounded-2xl flex-col gap-2" style={{ borderRadius: '1rem', padding: '0.5rem' }}>
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setTool(tool.id)}
            className={`btn-tool ${activeTool === tool.id ? 'active' : ''}`}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.25rem' }} />
        <button
          onClick={onDelete}
          className="btn-tool"
          title="Delete"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="bg-panel p-2 rounded-2xl flex-col gap-2" style={{ borderRadius: '1rem', padding: '0.5rem' }}>
        <button
          onClick={undo}
          disabled={!canUndo}
          className="btn-tool"
          title="Undo"
        >
          <Undo2 size={20} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="btn-tool"
          title="Redo"
        >
          <Redo2 size={20} />
        </button>
      </div>

      <div className="bg-panel p-2 rounded-2xl flex-col gap-2" style={{ borderRadius: '1rem', padding: '0.5rem' }}>
        {booleanOps.map((op) => (
          <button
            key={op.id}
            onClick={() => onBoolean(op.id)}
            className="btn-tool"
            title={op.label}
          >
            {op.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Toolbar;
