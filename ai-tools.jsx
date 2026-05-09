import { useState, useMemo, useRef, useEffect } from "react";

const TOOLS = [
  // Selection
  { id: 1, name: "Selection Tool", shortcut: "V", category: "Select", icon: "⬡", color: "#FF6B35", description: "Select, move, and transform entire objects on the artboard.", tip: "Hold Shift to select multiple objects." },
  { id: 2, name: "Direct Selection Tool", shortcut: "A", category: "Select", icon: "◈", color: "#FF6B35", description: "Select and edit individual anchor points and path segments.", tip: "Click a point, then drag to reshape paths freely." },
  { id: 3, name: "Magic Wand Tool", shortcut: "Y", category: "Select", icon: "✦", color: "#FF6B35", description: "Select objects with similar fill color, stroke, or opacity.", tip: "Double-click to set tolerance for selection range." },
  { id: 4, name: "Lasso Tool", shortcut: "Q", category: "Select", icon: "○", color: "#FF6B35", description: "Draw a freehand selection around anchor points.", tip: "Great for selecting specific points in complex paths." },

  // Draw
  { id: 5, name: "Pen Tool", shortcut: "P", category: "Draw", icon: "✒", color: "#4ECDC4", description: "Draw precise paths by placing anchor points with handles.", tip: "Click for sharp corners, click-drag for smooth curves." },
  { id: 6, name: "Curvature Tool", shortcut: "~", category: "Draw", icon: "〜", color: "#4ECDC4", description: "Draw and edit smooth curves intuitively without handles.", tip: "Double-click to add a corner point." },
  { id: 7, name: "Paintbrush Tool", shortcut: "B", category: "Draw", icon: "🖌", color: "#4ECDC4", description: "Paint freehand paths with selected brush styles.", tip: "Combine with Calligraphic brushes for lettering." },
  { id: 8, name: "Shaper Tool", shortcut: "⇧N", category: "Draw", icon: "⬟", color: "#4ECDC4", description: "Draw rough shapes and Illustrator converts them to perfect vectors.", tip: "Scribble inside overlapping shapes to merge or subtract." },
  { id: 9, name: "Line Segment Tool", shortcut: "\\", category: "Draw", icon: "╱", color: "#4ECDC4", description: "Draw straight lines at any angle.", tip: "Hold Shift to constrain to 45° increments." },
  { id: 10, name: "Eraser Tool", shortcut: "⇧E", category: "Draw", icon: "◻", color: "#4ECDC4", description: "Erase portions of paths and shapes.", tip: "Hold Alt/Option to erase in straight lines." },
  { id: 11, name: "Width Tool", shortcut: "⇧W", category: "Draw", icon: "⟺", color: "#4ECDC4", description: "Add variable width profiles to any stroke.", tip: "Drag sideways on a stroke to create tapered effects." },

  // Shape
  { id: 12, name: "Rectangle Tool", shortcut: "M", category: "Shape", icon: "▭", color: "#A78BFA", description: "Draw rectangles and squares on the artboard.", tip: "Hold Shift for perfect squares, Alt to draw from center." },
  { id: 13, name: "Shape Builder Tool", shortcut: "⇧M", category: "Shape", icon: "⬡+", color: "#A78BFA", description: "Combine, subtract, and intersect overlapping shapes.", tip: "Hold Alt to subtract a region instead of merging." },
  { id: 14, name: "Blend Tool", shortcut: "W", category: "Shape", icon: "⊸", color: "#A78BFA", description: "Create blends between shapes and colors.", tip: "Double-click to set steps or distance between blends." },

  // Type
  { id: 15, name: "Type Tool", shortcut: "T", category: "Type", icon: "T", color: "#F59E0B", description: "Create and edit text objects anywhere on the canvas.", tip: "Click to start point text, click-drag for an area text box." },

  // Transform
  { id: 16, name: "Rotate Tool", shortcut: "R", category: "Transform", icon: "↻", color: "#34D399", description: "Rotate objects around a defined origin point.", tip: "Click to set a custom pivot point, then drag to rotate." },
  { id: 17, name: "Scale Tool", shortcut: "S", category: "Transform", icon: "⤢", color: "#34D399", description: "Scale objects proportionally or non-proportionally.", tip: "Hold Shift while dragging to scale proportionally." },
  { id: 18, name: "Free Transform Tool", shortcut: "E", category: "Transform", icon: "⊡", color: "#34D399", description: "Move, scale, rotate, shear, and distort objects freely.", tip: "Use the widget handles for perspective distortion." },
  { id: 19, name: "Perspective Grid Tool", shortcut: "⇧P", category: "Transform", icon: "⟋", color: "#34D399", description: "Draw and place objects in 1-, 2-, or 3-point perspective.", tip: "Press Esc to exit perspective mode." },

  // Color
  { id: 20, name: "Eyedropper Tool", shortcut: "I", category: "Color", icon: "💧", color: "#60A5FA", description: "Sample and apply colors, gradients, and type properties.", tip: "Hold Shift to add a sampled color to a swatch." },
  { id: 21, name: "Gradient Tool", shortcut: "G", category: "Color", icon: "▓", color: "#60A5FA", description: "Create and edit gradients directly on objects.", tip: "Drag on an object to set direction; click stops to edit colors." },
  { id: 22, name: "Mesh Tool", shortcut: "U", category: "Color", icon: "⊞", color: "#60A5FA", description: "Apply multipoint gradients with fine color control.", tip: "Click to add mesh points; drag to reshape the mesh." },
  { id: 23, name: "Default Fill and Stroke", shortcut: "D", category: "Color", icon: "◫", color: "#60A5FA", description: "Reset fill to white and stroke to black.", tip: "Press D anytime to reset to Illustrator defaults." },
  { id: 24, name: "Swap Fill and Stroke", shortcut: "⇧X", category: "Color", icon: "⇄", color: "#60A5FA", description: "Swap the current fill and stroke colors.", tip: "Quick way to reverse your foreground/background colors." },

  // View
  { id: 25, name: "Zoom Tool", shortcut: "Z", category: "View", icon: "⊕", color: "#FB7185", description: "Zoom in and out of the artboard.", tip: "Hold Alt/Option to zoom out. Double-click to fit screen." },
  { id: 26, name: "Hand Tool", shortcut: "H", category: "View", icon: "✋", color: "#FB7185", description: "Pan around the canvas without changing selections.", tip: "Hold Space bar temporarily to use Hand Tool from any tool." },
  { id: 27, name: "Artboard Tool", shortcut: "⇧O", category: "View", icon: "⬜", color: "#FB7185", description: "Create, resize, and manage multiple artboards.", tip: "Drag to create a new artboard, double-click to rename." },
  { id: 28, name: "Slice Tool", shortcut: "⇧K", category: "View", icon: "✂", color: "#FB7185", description: "Define slices for exporting specific areas of artwork.", tip: "Use Object > Slice > Make to slice from selections." },

  // Symbols & Graphs
  { id: 29, name: "Symbol Sprayer Tool", shortcut: "⇧S", category: "Symbols", icon: "✷", color: "#E879F9", description: "Spray multiple instances of a symbol onto the artboard.", tip: "Use the other symbolism tools to adjust size, spacing, and color." },
  { id: 30, name: "Column Graph Tool", shortcut: "J", category: "Symbols", icon: "▐▌", color: "#E879F9", description: "Create bar charts and graphs from data.", tip: "Double-click to edit the data table after creating." },

  // Modes
  { id: 31, name: "Draw Normal", shortcut: "⇧D", category: "Modes", icon: "●", color: "#94A3B8", description: "Draw new shapes on top of existing objects normally.", tip: "Default drawing mode in Illustrator." },
  { id: 32, name: "Draw Behind", shortcut: "⇧D", category: "Modes", icon: "◉", color: "#94A3B8", description: "Draw new shapes behind all existing objects.", tip: "Cycle through drawing modes with Shift+D." },
  { id: 33, name: "Draw Inside", shortcut: "⇧D", category: "Modes", icon: "⊙", color: "#94A3B8", description: "Draw inside a selected shape as a clipping mask.", tip: "Select a shape first, then activate Draw Inside." },
  { id: 34, name: "Change Screen Mode", shortcut: "F", category: "Modes", icon: "⬛", color: "#94A3B8", description: "Toggle between Normal, Full Screen, and Presentation modes.", tip: "Press Tab to hide/show all panels in any screen mode." },

  // Misc
  { id: 35, name: "None", shortcut: "/", category: "Color", icon: "⊘", color: "#60A5FA", description: "Apply no fill or stroke to a selected object.", tip: "Press / to set the active fill or stroke to None." },
  { id: 36, name: "Color", shortcut: ",", category: "Color", icon: "◕", color: "#60A5FA", description: "Switch the active attribute back to a solid color.", tip: "Use with Fill/Stroke indicator to toggle between color modes." },
  { id: 37, name: "Gradient", shortcut: ".", category: "Color", icon: "◑", color: "#60A5FA", description: "Apply a gradient to the active fill or stroke.", tip: "Press G to activate the Gradient Tool to edit it." },
  { id: 38, name: "Edit Tool Bar", shortcut: "—", category: "Modes", icon: "≡", color: "#94A3B8", description: "Customize the toolbox by adding, removing, and reordering tools.", tip: "Click the '...' at the bottom of the toolbar to open." },
];

const CATEGORIES = ["All", "Select", "Draw", "Shape", "Type", "Transform", "Color", "View", "Symbols", "Modes"];

const CAT_ICONS = {
  All: "◈", Select: "⬡", Draw: "✒", Shape: "▭", Type: "T",
  Transform: "↻", Color: "◕", View: "⊕", Symbols: "✷", Modes: "◉"
};

export default function App() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const searchRef = useRef();
  const sheetRef = useRef();

  const filtered = useMemo(() => {
    return TOOLS.filter(t => {
      const matchCat = activeCategory === "All" || t.category === activeCategory;
      const q = search.toLowerCase();
      const matchQ = !q || t.name.toLowerCase().includes(q) || t.shortcut.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [search, activeCategory]);

  function openTool(tool) {
    setSelected(tool);
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setTimeout(() => setSelected(null), 300);
  }

  useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sheetOpen]);

  return (
    <div style={styles.root}>
      {/* Noise overlay */}
      <div style={styles.noise} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.aiLogo}>
            <span style={styles.aiText}>Ai</span>
          </div>
          <div>
            <div style={styles.appTitle}>Illustrator Tools</div>
            <div style={styles.appSub}>{TOOLS.length} tools · quick reference</div>
          </div>
          <div style={styles.badge}>{filtered.length}</div>
        </div>

        {/* Search */}
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>⌕</span>
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tools or shortcuts…"
            style={styles.search}
          />
          {search && (
            <button onClick={() => setSearch("")} style={styles.clearBtn}>✕</button>
          )}
        </div>

        {/* Category Tabs */}
        <div style={styles.tabs}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                ...styles.tab,
                ...(activeCategory === cat ? styles.tabActive : {})
              }}
            >
              <span style={styles.tabIcon}>{CAT_ICONS[cat]}</span>
              <span style={styles.tabLabel}>{cat}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Tool Grid */}
      <main style={styles.main}>
        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>◌</div>
            <div style={styles.emptyText}>No tools found</div>
            <div style={styles.emptySub}>Try a different search or category</div>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} index={i} onClick={() => openTool(tool)} />
            ))}
          </div>
        )}
        <div style={{ height: 40 }} />
      </main>

      {/* Bottom Sheet Overlay */}
      <div
        onClick={closeSheet}
        style={{
          ...styles.overlay,
          opacity: sheetOpen ? 1 : 0,
          pointerEvents: sheetOpen ? "all" : "none",
        }}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        style={{
          ...styles.sheet,
          transform: sheetOpen ? "translateY(0)" : "translateY(110%)",
        }}
      >
        {selected && <ToolSheet tool={selected} onClose={closeSheet} />}
      </div>
    </div>
  );
}

function ToolCard({ tool, index, onClick }) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        ...styles.card,
        transform: pressed ? "scale(0.94)" : "scale(1)",
        animationDelay: `${index * 30}ms`,
      }}
    >
      <div style={{ ...styles.cardGlow, background: `radial-gradient(circle at 30% 30%, ${tool.color}22, transparent 70%)` }} />
      <div style={{ ...styles.cardIcon, color: tool.color }}>{tool.icon}</div>
      <div style={styles.cardName}>{tool.name}</div>
      <div style={{ ...styles.cardShortcut, borderColor: tool.color + "55", color: tool.color }}>
        {tool.shortcut}
      </div>
    </button>
  );
}

function ToolSheet({ tool, onClose }) {
  return (
    <div style={styles.sheetInner}>
      <div style={styles.sheetHandle} />

      <div style={styles.sheetHeader}>
        <div style={{ ...styles.sheetIconBg, background: tool.color + "22", border: `1.5px solid ${tool.color}44` }}>
          <span style={{ ...styles.sheetIcon, color: tool.color }}>{tool.icon}</span>
        </div>
        <div style={styles.sheetTitleGroup}>
          <div style={styles.sheetTitle}>{tool.name}</div>
          <div style={{ ...styles.sheetCatBadge, background: tool.color + "22", color: tool.color }}>
            {tool.category}
          </div>
        </div>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>
      </div>

      <div style={{ ...styles.shortcutRow, borderColor: tool.color + "33" }}>
        <span style={styles.shortcutLabel}>Keyboard Shortcut</span>
        <kbd style={{ ...styles.kbd, color: tool.color, borderColor: tool.color + "55", background: tool.color + "11" }}>
          {tool.shortcut}
        </kbd>
      </div>

      <div style={styles.descSection}>
        <div style={styles.descLabel}>DESCRIPTION</div>
        <p style={styles.desc}>{tool.description}</p>
      </div>

      <div style={{ ...styles.tipBox, borderLeftColor: tool.color }}>
        <div style={{ ...styles.tipLabel, color: tool.color }}>⚡ PRO TIP</div>
        <p style={styles.tipText}>{tool.tip}</p>
      </div>

      <div style={styles.sheetFooter}>
        <div style={styles.footerDot} />
        <span style={styles.footerText}>Adobe Illustrator · {tool.category} Tools</span>
        <div style={styles.footerDot} />
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0E0F11",
    fontFamily: "'Syne', 'DM Sans', system-ui, sans-serif",
    color: "#E8E9ED",
    position: "relative",
    overflowX: "hidden",
    maxWidth: 480,
    margin: "0 auto",
    boxShadow: "0 0 80px #000a",
  },
  noise: {
    position: "fixed",
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
    opacity: 0.5,
    pointerEvents: "none",
    zIndex: 0,
    maxWidth: 480,
    margin: "0 auto",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "rgba(14,15,17,0.92)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid #1E2025",
    padding: "16px 16px 0",
  },
  headerTop: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  aiLogo: {
    width: 42,
    height: 42,
    borderRadius: 10,
    background: "linear-gradient(135deg, #FF6B00, #FF9A00)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 20px #FF6B0044",
  },
  aiText: {
    fontWeight: 900,
    fontSize: 18,
    color: "#fff",
    letterSpacing: "-1px",
    fontStyle: "italic",
  },
  appTitle: {
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: "-0.3px",
    color: "#F1F2F6",
  },
  appSub: {
    fontSize: 11,
    color: "#6B7280",
    letterSpacing: "0.3px",
    marginTop: 1,
  },
  badge: {
    marginLeft: "auto",
    background: "#FF6B0020",
    color: "#FF8C3B",
    border: "1px solid #FF6B0040",
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 13,
    fontWeight: 700,
  },
  searchWrap: {
    position: "relative",
    marginBottom: 12,
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 18,
    color: "#4B5563",
    pointerEvents: "none",
    lineHeight: 1,
  },
  search: {
    width: "100%",
    background: "#161820",
    border: "1px solid #2A2D35",
    borderRadius: 12,
    padding: "11px 40px 11px 38px",
    color: "#E8E9ED",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  clearBtn: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "#2A2D35",
    border: "none",
    borderRadius: "50%",
    width: 22,
    height: 22,
    color: "#9CA3AF",
    fontSize: 10,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tabs: {
    display: "flex",
    gap: 6,
    overflowX: "auto",
    paddingBottom: 12,
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 12px",
    borderRadius: 20,
    border: "1px solid #2A2D35",
    background: "transparent",
    color: "#6B7280",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
    fontFamily: "inherit",
    flexShrink: 0,
  },
  tabActive: {
    background: "#FF6B0020",
    borderColor: "#FF6B0055",
    color: "#FF8C3B",
  },
  tabIcon: {
    fontSize: 11,
  },
  tabLabel: {
    letterSpacing: "0.2px",
  },
  main: {
    position: "relative",
    zIndex: 1,
    padding: "16px 12px 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
  },
  card: {
    position: "relative",
    background: "#13151A",
    border: "1px solid #1E2025",
    borderRadius: 16,
    padding: "16px 10px 14px",
    cursor: "pointer",
    textAlign: "center",
    transition: "transform 0.15s cubic-bezier(.34,1.56,.64,1), border-color 0.2s",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    animation: "fadeUp 0.3s both",
    fontFamily: "inherit",
  },
  cardGlow: {
    position: "absolute",
    inset: 0,
    opacity: 0.6,
    borderRadius: 16,
    pointerEvents: "none",
  },
  cardIcon: {
    fontSize: 26,
    lineHeight: 1,
    position: "relative",
    zIndex: 1,
  },
  cardName: {
    fontSize: 11,
    fontWeight: 600,
    color: "#C9CBD5",
    lineHeight: 1.3,
    letterSpacing: "0px",
    position: "relative",
    zIndex: 1,
  },
  cardShortcut: {
    fontSize: 10,
    fontWeight: 700,
    border: "1px solid",
    borderRadius: 6,
    padding: "2px 7px",
    letterSpacing: "0.5px",
    position: "relative",
    zIndex: 1,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#4B5563",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 700,
    color: "#6B7280",
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: "#374151",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(4px)",
    zIndex: 20,
    transition: "opacity 0.3s",
    maxWidth: 480,
    margin: "0 auto",
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
  },
  sheet: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%) translateY(110%)",
    width: "100%",
    maxWidth: 480,
    background: "#13151A",
    borderRadius: "24px 24px 0 0",
    zIndex: 30,
    transition: "transform 0.35s cubic-bezier(.32,1,.45,1)",
    boxShadow: "0 -20px 60px #000",
    maxHeight: "85vh",
    overflowY: "auto",
  },
  sheetInner: {
    padding: "0 20px 40px",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    background: "#2A2D35",
    borderRadius: 2,
    margin: "12px auto 20px",
  },
  sheetHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  sheetIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sheetIcon: {
    fontSize: 28,
  },
  sheetTitleGroup: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#F1F2F6",
    letterSpacing: "-0.3px",
    marginBottom: 5,
  },
  sheetCatBadge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 20,
    padding: "2px 10px",
    letterSpacing: "0.5px",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "#1E2025",
    border: "1px solid #2A2D35",
    color: "#6B7280",
    fontSize: 12,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontFamily: "inherit",
  },
  shortcutRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 0",
    borderTop: "1px solid",
    borderBottom: "1px solid",
    marginBottom: 20,
  },
  shortcutLabel: {
    fontSize: 12,
    color: "#6B7280",
    letterSpacing: "0.5px",
    fontWeight: 600,
    textTransform: "uppercase",
  },
  kbd: {
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontSize: 15,
    fontWeight: 700,
    border: "1px solid",
    borderRadius: 8,
    padding: "4px 14px",
  },
  descSection: {
    marginBottom: 16,
  },
  descLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "1.5px",
    color: "#4B5563",
    marginBottom: 8,
  },
  desc: {
    fontSize: 15,
    lineHeight: 1.65,
    color: "#C9CBD5",
    margin: 0,
  },
  tipBox: {
    background: "#161820",
    borderLeft: "3px solid",
    borderRadius: "0 12px 12px 0",
    padding: "12px 14px",
    marginBottom: 24,
  },
  tipLabel: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "1px",
    marginBottom: 6,
  },
  tipText: {
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 1.6,
    margin: 0,
  },
  sheetFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: "50%",
    background: "#2A2D35",
  },
  footerText: {
    fontSize: 11,
    color: "#374151",
    letterSpacing: "0.5px",
  },
};

// Inject Google Font + keyframe
const style = document.createElement("style");
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body { margin: 0; background: #0a0b0d; }
  input::placeholder { color: #4B5563; }
  ::-webkit-scrollbar { display: none; }
  button { cursor: pointer; }
`;
document.head.appendChild(style);
