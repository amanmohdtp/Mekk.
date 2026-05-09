import React, { useState } from 'react';
import { Settings, Palette, Zap } from 'lucide-react';

const Inspector = ({ 
  selectedItem, 
  strokeColor, 
  fillColor, 
  strokeWidth, 
  onChange 
}) => {
  const [activeTab, setActiveTab] = useState('properties');

  return (
    <div className="inspector bg-panel">
      <div className="flex-col gap-4">
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
          <button 
            onClick={() => setActiveTab('properties')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: activeTab === 'properties' ? '#3b82f6' : '#9ca3af',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <Settings size={14} /> PROPERTIES
          </button>
          <button 
            onClick={() => setActiveTab('appearance')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: activeTab === 'appearance' ? '#3b82f6' : '#9ca3af',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <Palette size={14} /> APPEARANCE
          </button>
        </div>

        {activeTab === 'properties' ? (
          <div className="flex-col gap-6">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {selectedItem ? 'Selected Object' : 'Default Style'}
              </span>
            </div>

            {selectedItem && selectedItem.bounds ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="flex-col gap-2">
                  <label style={{ fontSize: '12px', color: '#9ca3af' }}>X</label>
                  <input
                    type="text"
                    value={Math.round(selectedItem.bounds.x)}
                    disabled
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)', background: '#151515', color: 'white' }}
                  />
                </div>
                <div className="flex-col gap-2">
                  <label style={{ fontSize: '12px', color: '#9ca3af' }}>Y</label>
                  <input
                    type="text"
                    value={Math.round(selectedItem.bounds.y)}
                    disabled
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)', background: '#151515', color: 'white' }}
                  />
                </div>
                <div className="flex-col gap-2">
                  <label style={{ fontSize: '12px', color: '#9ca3af' }}>Width</label>
                  <input
                    type="text"
                    value={Math.round(selectedItem.bounds.width)}
                    disabled
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)', background: '#151515', color: 'white' }}
                  />
                </div>
                <div className="flex-col gap-2">
                  <label style={{ fontSize: '12px', color: '#9ca3af' }}>Height</label>
                  <input
                    type="text"
                    value={Math.round(selectedItem.bounds.height)}
                    disabled
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)', background: '#151515', color: 'white' }}
                  />
                </div>
              </div>
            ) : null}

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
        ) : (
          <div className="flex-col gap-4">
            <div className="flex-col gap-2">
              <label style={{ fontSize: '12px', color: '#9ca3af' }}>Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                defaultValue="1"
                onChange={(e) => {
                  if (selectedItem) {
                    selectedItem.opacity = parseFloat(e.target.value);
                  }
                }}
                style={{ width: '100%' }}
              />
            </div>
            <div className="flex-col gap-2">
              <label style={{ fontSize: '12px', color: '#9ca3af' }}>Blend Mode</label>
              <select 
                style={{ 
                  background: '#1a1a1a', 
                  color: 'white', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  fontSize: '12px'
                }}
                onChange={(e) => {
                  if (selectedItem) {
                    selectedItem.blendMode = e.target.value;
                  }
                }}
              >
                <option value="normal">Normal</option>
                <option value="multiply">Multiply</option>
                <option value="screen">Screen</option>
                <option value="overlay">Overlay</option>
                <option value="darken">Darken</option>
                <option value="lighten">Lighten</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', marginTop: '0.5rem' }}>
              <Zap size={16} style={{ color: '#3b82f6' }} />
              <div className="flex-col">
                <span style={{ fontSize: '11px', color: 'white', fontWeight: 600 }}>PRO EFFECTS</span>
                <span style={{ fontSize: '10px', color: '#9ca3af' }}>Drop Shadow, Blur, Inner Glow</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inspector;
