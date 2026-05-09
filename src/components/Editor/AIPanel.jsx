import React, { useState } from 'react';
import { Sparkles, Wand2, Palette, RefreshCw } from 'lucide-react';

const AIPanel = ({ onApplyAI }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt) return;
    setIsGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      onApplyAI(prompt);
      setIsGenerating(false);
    }, 1500);
  };

  const suggestions = [
    "Synthwave sunset palette",
    "Minimalist line art style",
    "Organic liquid gradients",
    "Neo-brutalism colors"
  ];

  return (
    <div className="ai-panel bg-panel" style={{
        position: 'absolute',
        top: '4.5rem',
        right: '1rem',
        width: '280px',
        padding: '1.25rem',
        borderRadius: '1.25rem',
        zIndex: 10
    }}>
      <div className="flex-col gap-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} className="text-blue-500" style={{ color: '#3b82f6' }} />
          <h3 style={{ color: 'white', fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>Mekk AI</h3>
        </div>

        <div className="flex-col gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe a style or color palette..."
            style={{
              width: '100%',
              height: '80px',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.75rem',
              padding: '0.75rem',
              color: 'white',
              fontSize: '0.8rem',
              resize: 'none',
              outline: 'none'
            }}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: isGenerating || !prompt ? 0.6 : 1,
              boxShadow: isGenerating ? 'none' : '0 4px 15px rgba(139, 92, 246, 0.4)'
            }}
          >
            {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Wand2 size={16} />}
            {isGenerating ? 'GENERATE...' : 'APPLY MAGIC'}
          </button>
        </div>

        <div className="flex-col gap-2">
          <label style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>SUGGESTIONS</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setPrompt(s)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: '#d1d5db',
                  cursor: 'pointer'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
