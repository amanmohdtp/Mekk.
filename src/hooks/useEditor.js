import { useState, useCallback, useRef, useEffect } from 'react';
import paper from 'paper';

export const useEditor = (canvasRef) => {
  const [activeTool, setActiveTool] = useState('select');
  const [selectedItem, setSelectedItem] = useState(null);
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const projectRef = useRef(null);
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  const saveHistory = useCallback(() => {
    if (!projectRef.current) return;
    
    const json = projectRef.current.exportJSON();
    
    // Remove future history if we're in the middle of undo/redo chain
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(json);
    
    // Limit history size
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      historyIndexRef.current++;
    }
    
    historyRef.current = newHistory;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const json = historyRef.current[historyIndexRef.current];
      projectRef.current.clear();
      projectRef.current.importJSON(json);
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(true);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const json = historyRef.current[historyIndexRef.current];
      projectRef.current.clear();
      projectRef.current.importJSON(json);
      setCanUndo(true);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    paper.setup(canvasRef.current);
    projectRef.current = paper.project;
    
    // Setup view navigation
    let lastZoom = paper.view.zoom;
    let lastCenter = paper.view.center;

    // Handle touch gestures for pan/zoom
    const canvas = canvasRef.current;
    let initialDist = 0;
    let initialZoom = 1;

    let initialCenter = paper.view.center;
    let initialTouchPos = { x: 0, y: 0 };

    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialDist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            initialZoom = paper.view.zoom;
            initialCenter = paper.view.center;
            initialTouchPos = {
                x: (e.touches[0].pageX + e.touches[1].pageX) / 2,
                y: (e.touches[0].pageY + e.touches[1].pageY) / 2
            };
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            
            // Zoom
            const dist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            const zoom = (dist / initialDist) * initialZoom;
            paper.view.zoom = Math.max(0.1, Math.min(zoom, 10));

            // Pan
            const currentTouchPos = {
                x: (e.touches[0].pageX + e.touches[1].pageX) / 2,
                y: (e.touches[0].pageY + e.touches[1].pageY) / 2
            };
            const delta = {
                x: (currentTouchPos.x - initialTouchPos.x) / paper.view.zoom,
                y: (currentTouchPos.y - initialTouchPos.y) / paper.view.zoom
            };
            paper.view.center = initialCenter.subtract(new paper.Point(delta.x, delta.y));
        }
    }, { passive: false });

    // Initial history state
    saveHistory();

    // Default tool: selection
    const selectionTool = new paper.Tool();
    selectionTool.name = 'select';
    
    let hitItem = null;
    let path = null;

    selectionTool.onMouseDown = (event) => {
      const hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 10
      };

      const hitResult = paper.project.hitTest(event.point, hitOptions);
      
      paper.project.deselectAll();
      setSelectedItem(null);

      if (hitResult) {
        hitItem = hitResult.item;
        hitItem.selected = true;
        setSelectedItem(hitItem);
        
        if (hitResult.type === 'segment') {
            path = hitResult.segment;
        } else {
            path = hitItem;
        }
      } else {
        hitItem = null;
        path = null;
      }
    };

    selectionTool.onMouseDrag = (event) => {
      if (path) {
        if (path.type === 'segment') {
            path.point = path.point.add(event.delta);
        } else {
            path.position = path.position.add(event.delta);
        }
      }
    };
    
    selectionTool.onMouseUp = () => {
        if (hitItem) {
            saveHistory();
        }
    }

    // Pen Tool
    const penTool = new paper.Tool();
    penTool.name = 'pen';
    let currentPath;
    let currentSegment;

    penTool.onMouseDown = (event) => {
      if (!currentPath) {
        currentPath = new paper.Path();
        currentPath.strokeColor = strokeColor;
        currentPath.fillColor = fillColor;
        currentPath.strokeWidth = strokeWidth;
        currentSegment = currentPath.add(event.point);
      } else {
        const hitResult = currentPath.hitTest(event.point, { segments: true, tolerance: 10 });
        if (hitResult && hitResult.type === 'segment' && hitResult.segment === currentPath.firstSegment) {
          currentPath.closed = true;
          saveHistory();
          currentPath = null;
          currentSegment = null;
        } else {
          currentSegment = currentPath.add(event.point);
        }
      }
    };

    penTool.onMouseDrag = (event) => {
      if (currentSegment) {
        const delta = event.point.subtract(currentSegment.point);
        currentSegment.handleOut = delta;
        currentSegment.handleIn = delta.multiply(-1);
      }
    };

    penTool.onMouseUp = () => {
      if (currentPath && currentPath.closed) {
          currentPath = null;
          currentSegment = null;
      }
    }

    // Rect Tool
    const rectTool = new paper.Tool();
    rectTool.name = 'rect';
    let rect;

    rectTool.onMouseDown = (event) => {
      rect = new paper.Path.Rectangle({
        point: event.point,
        size: [0, 0],
        strokeColor: strokeColor,
        fillColor: fillColor,
        strokeWidth: strokeWidth
      });
    };

    rectTool.onMouseDrag = (event) => {
      rect.remove();
      rect = new paper.Path.Rectangle({
        from: event.downPoint,
        to: event.point,
        strokeColor: strokeColor,
        fillColor: fillColor,
        strokeWidth: strokeWidth
      });
    };
    
    rectTool.onMouseUp = () => {
        saveHistory();
    }

    // Circle Tool
    const circleTool = new paper.Tool();
    circleTool.name = 'circle';
    let circle;

    circleTool.onMouseDown = (event) => {
      circle = new paper.Path.Circle({
        center: event.point,
        radius: 0,
        strokeColor: strokeColor,
        fillColor: fillColor,
        strokeWidth: strokeWidth
      });
    };

    circleTool.onMouseDrag = (event) => {
      circle.remove();
      circle = new paper.Path.Circle({
        center: event.downPoint,
        radius: event.downPoint.getDistance(event.point),
        strokeColor: strokeColor,
        fillColor: fillColor,
        strokeWidth: strokeWidth
      });
    };
    
    circleTool.onMouseUp = () => {
        saveHistory();
    }

    selectionTool.activate();

    return () => {
      paper.project.remove();
    };
  }, []);

  const setTool = useCallback((toolName) => {
    const tool = paper.tools.find(t => t.name === toolName);
    if (tool) {
      tool.activate();
      setActiveTool(toolName);
    }
  }, []);

  const updateSelectedStyle = useCallback((style) => {
    if (selectedItem) {
      if (style.strokeColor !== undefined) {
        selectedItem.strokeColor = style.strokeColor;
        setStrokeColor(style.strokeColor);
      }
      if (style.fillColor !== undefined) {
        selectedItem.fillColor = style.fillColor;
        setFillColor(style.fillColor);
      }
      if (style.strokeWidth !== undefined) {
        selectedItem.strokeWidth = style.strokeWidth;
        setStrokeWidth(style.strokeWidth);
      }
      saveHistory();
    } else {
        if (style.strokeColor !== undefined) setStrokeColor(style.strokeColor);
        if (style.fillColor !== undefined) setFillColor(style.fillColor);
        if (style.strokeWidth !== undefined) setStrokeWidth(style.strokeWidth);
    }
  }, [selectedItem, saveHistory]);
  
  const performBoolean = useCallback((operation) => {
      const selected = paper.project.selectedItems;
      if (selected.length < 2) return;
      
      let result = selected[0];
      for (let i = 1; i < selected.length; i++) {
          const next = selected[i];
          const newResult = result[operation](next);
          result.remove();
          next.remove();
          result = newResult;
      }
      result.selected = true;
      setSelectedItem(result);
      saveHistory();
  }, [saveHistory]);

  const deleteSelected = useCallback(() => {
    if (selectedItem) {
      selectedItem.remove();
      setSelectedItem(null);
      saveHistory();
    }
  }, [selectedItem, saveHistory]);

  return {
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
    paper
  };
};
