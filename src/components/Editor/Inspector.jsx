import React from 'react';

const Inspector = ({ 
  selectedItem, 
  strokeColor, 
  fillColor, 
  strokeWidth, 
  onChange 
}) => {
  return (
    <div className="inspector bg-panel">
      <div className="flex-col gap-6">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
          <h3 style={{ color: 'white', fontWeight: 600, margin: 0 }}>Properties</h3>
          <span style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 'auto' }}>
            {selectedItem ? 'Selected Object' : 'Default Style'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="flex-col gap-2">
            <label style={{ fontSize: '12px', color: '#9ca3af' }}>Fill Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="color"
                value={fillColor === 'transparent' ? '#000000' : fillColor}
                onChange={(e) => onChange({ fillColor: e.target.value })}
                style={{ width: '100%', height: '40px', background: 'transparent', border: 'none', cursor: 'pointer' }}
              />
              <button
                onClick={() => onChange({ fillColor: 'transparent' })}
                style={{ 
                  padding: '2px 8px', 
                  fontSize: '10px', 
                  borderRadius: '4px', 
                  border: fillColor === 'transparent' ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                  color: fillColor === 'transparent' ? '#3b82f6' : '#9ca3af',
                  background: 'transparent'
                }}
              >
                NONE
              </button>
            </div>
          </div>

          <div className="flex-col gap-2">
            <label style={{ fontSize: '12px', color: '#9ca3af' }}>Stroke Color</label>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => onChange({ strokeColor: e.target.value })}
              style={{ width: '100%', height: '40px', background: 'transparent', border: 'none', cursor: 'pointer' }}
            />
          </div>
        </div>

        <div className="flex-col gap-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', color: '#9ca3af' }}>Stroke Width</label>
            <span style={{ fontSize: '12px', color: '#60a5fa' }}>{strokeWidth}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={strokeWidth}
            onChange={(e) => onChange({ strokeWidth: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Inspector;
