import React, { useEffect, useState } from 'react';
import { Layers, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import paper from 'paper';

const LayersPanel = ({ projectUpdated }) => {
  const [layers, setLayers] = useState([]);

  useEffect(() => {
    if (paper.project) {
      setLayers([...paper.project.layers]);
    }
  }, [projectUpdated]);

  const toggleVisible = (layer) => {
    layer.visible = !layer.visible;
    setLayers([...paper.project.layers]);
  };

  const toggleLocked = (layer) => {
    layer.locked = !layer.locked;
    setLayers([...paper.project.layers]);
  };

  return (
    <div className="layers-panel bg-panel" style={{
        position: 'absolute',
        top: '19.5rem',
        right: '1rem',
        width: '280px',
        maxHeight: '300px',
        padding: '1rem',
        borderRadius: '1.25rem',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Layers size={18} style={{ color: '#9ca3af' }} />
        <h3 style={{ color: 'white', fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>Layers</h3>
      </div>
      
      <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {layers.map((layer, index) => (
          <div key={layer.id || index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            background: layer.selected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            borderRadius: '0.5rem',
            border: layer.selected ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent'
          }}>
            <button 
              onClick={() => toggleVisible(layer)}
              style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0 }}
            >
              {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <button 
              onClick={() => toggleLocked(layer)}
              style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0 }}
            >
              {layer.locked ? <Lock size={16} /> : <Unlock size={16} />}
            </button>
            <span style={{ color: 'white', fontSize: '0.8rem', flex: 1 }}>
              {layer.name || `Layer ${index + 1}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayersPanel;
