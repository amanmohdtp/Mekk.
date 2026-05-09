import { useState, useCallback, useRef, useEffect } from 'react';
import paper from 'paper';

export const useEditor = (canvasRef) => {
  const [activeTool, setActiveToolState] = useState('select');
  const [selectedItem, setSelectedItem] = useState(null);
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [projectUpdated, setProjectUpdated] = useState(0);

  const projectRef = useRef(null);
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const toolRefs = useRef({});
  const styleRef = useRef({ strokeColor: '#ffffff', fillColor: 'transparent', strokeWidth: 2 });
  const isPanningRef = useRef(false);

  useEffect(() => {
    styleRef.current = { strokeColor, fillColor, strokeWidth };
  }, [strokeColor, fillColor, strokeWidth]);

  const saveHistory = useCallback(() => {
    if (!projectRef.current) return;

    const json = projectRef.current.exportJSON();
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(json);

    if (newHistory.length > 50) {
      newHistory.shift();
      historyIndexRef.current = newHistory.length - 1;
    } else {
      historyIndexRef.current = newHistory.length - 1;
    }

    historyRef.current = newHistory;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    setProjectUpdated((prev) => prev + 1);
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const json = historyRef.current[historyIndexRef.current];
      projectRef.current.clear();
      projectRef.current.importJSON(json);
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(true);
      setProjectUpdated((prev) => prev + 1);
      setSelectedItem(null);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const json = historyRef.current[historyIndexRef.current];
      projectRef.current.clear();
      projectRef.current.importJSON(json);
      setCanUndo(true);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      setProjectUpdated((prev) => prev + 1);
      setSelectedItem(null);
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    paper.setup(canvasRef.current);
    projectRef.current = paper.project;
    projectRef.current.clear();
    toolRefs.current = {};

    const canvas = canvasRef.current;
    let activePath = null;
    let activeSegment = null;
    let currentBox = null;
    let currentCircle = null;
    let currentLine = null;
    let selectionTarget = null;
    let dragItem = null;
    let initialPanPoint = null;

    const updateSelection = (item) => {
      projectRef.current.deselectAll();
      if (item) {
        item.selected = true;
        setSelectedItem(item);
        setStrokeColor(item.strokeColor?.toCSS(true) || '#ffffff');
        setFillColor(item.fillColor?.toCSS?.(true) || (item.fillColor === 'transparent' ? 'transparent' : '#ffffff'));
        setStrokeWidth(item.strokeWidth || 1);
      } else {
        setSelectedItem(null);
      }
    };

    const selectionTool = new paper.Tool();
    selectionTool.name = 'select';

    selectionTool.onMouseDown = (event) => {
      const hit = projectRef.current.hitTest(event.point, {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 10,
      });

      if (hit) {
        selectionTarget = hit.item;
        selectionTarget.selected = true;
        dragItem = hit.type === 'segment' ? hit.segment : hit.item;
        updateSelection(selectionTarget);
      } else {
        selectionTarget = null;
        dragItem = null;
        updateSelection(null);
      }

      if (event.event.button === 1 || event.modifiers.space) {
        isPanningRef.current = true;
        initialPanPoint = event.point;
      }
    };

    selectionTool.onMouseDrag = (event) => {
      if (isPanningRef.current) {
        paper.view.center = paper.view.center.subtract(event.delta);
        return;
      }

      if (dragItem) {
        if (dragItem instanceof paper.Segment) {
          dragItem.point = dragItem.point.add(event.delta);
        } else {
          dragItem.position = dragItem.position.add(event.delta);
        }
      }
    };

    selectionTool.onMouseUp = () => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
      }
      if (dragItem) {
        saveHistory();
      }
      dragItem = null;
      selectionTarget = null;
    };

    const penTool = new paper.Tool();
    penTool.name = 'pen';

    penTool.onMouseDown = (event) => {
      if (!activePath || activePath.closed) {
        activePath = new paper.Path({
          strokeColor: styleRef.current.strokeColor,
          fillColor: styleRef.current.fillColor,
          strokeWidth: styleRef.current.strokeWidth,
          fullySelected: false,
          selected: false,
        });
        activePath.add(event.point);
        activeSegment = activePath.lastSegment;
      } else {
        const hit = activePath.hitTest(event.point, { segments: true, tolerance: 10 });
        if (hit && hit.segment === activePath.firstSegment) {
          activePath.closed = true;
          activePath.smooth();
          saveHistory();
          activePath = null;
          activeSegment = null;
          return;
        }
        activeSegment = activePath.add(event.point);
      }
    };

    penTool.onMouseDrag = (event) => {
      if (activeSegment) {
        activeSegment.point = event.point;
      }
    };

    penTool.onMouseUp = () => {
      if (activePath && activePath.segments.length > 1) {
        activePath.smooth();
      }
    };

    const rectTool = new paper.Tool();
    rectTool.name = 'rect';

    rectTool.onMouseDown = (event) => {
      if (currentBox) currentBox.remove();
      currentBox = new paper.Path.Rectangle({
        from: event.point,
        to: event.point,
        strokeColor: styleRef.current.strokeColor,
        fillColor: styleRef.current.fillColor,
        strokeWidth: styleRef.current.strokeWidth,
      });
    };

    rectTool.onMouseDrag = (event) => {
      if (currentBox) {
        currentBox.remove();
      }
      currentBox = new paper.Path.Rectangle({
        from: event.downPoint,
        to: event.point,
        strokeColor: styleRef.current.strokeColor,
        fillColor: styleRef.current.fillColor,
        strokeWidth: styleRef.current.strokeWidth,
      });
    };

    rectTool.onMouseUp = () => {
      if (currentBox) {
        saveHistory();
        currentBox = null;
      }
    };

    const circleTool = new paper.Tool();
    circleTool.name = 'circle';

    circleTool.onMouseDown = (event) => {
      if (currentCircle) currentCircle.remove();
      currentCircle = new paper.Path.Circle({
        center: event.point,
        radius: 0,
        strokeColor: styleRef.current.strokeColor,
        fillColor: styleRef.current.fillColor,
        strokeWidth: styleRef.current.strokeWidth,
      });
    };

    circleTool.onMouseDrag = (event) => {
      if (currentCircle) {
        currentCircle.remove();
      }
      currentCircle = new paper.Path.Circle({
        center: event.downPoint,
        radius: event.downPoint.getDistance(event.point),
        strokeColor: styleRef.current.strokeColor,
        fillColor: styleRef.current.fillColor,
        strokeWidth: styleRef.current.strokeWidth,
      });
    };

    circleTool.onMouseUp = () => {
      if (currentCircle) {
        saveHistory();
        currentCircle = null;
      }
    };

    const lineTool = new paper.Tool();
    lineTool.name = 'line';

    lineTool.onMouseDown = (event) => {
      if (currentLine) currentLine.remove();
      currentLine = new paper.Path.Line({
        from: event.point,
        to: event.point,
        strokeColor: styleRef.current.strokeColor,
        strokeWidth: styleRef.current.strokeWidth,
      });
    };

    lineTool.onMouseDrag = (event) => {
      if (currentLine) {
        currentLine.remove();
        currentLine = new paper.Path.Line({
          from: event.downPoint,
          to: event.point,
          strokeColor: styleRef.current.strokeColor,
          strokeWidth: styleRef.current.strokeWidth,
        });
      }
    };

    lineTool.onMouseUp = () => {
      if (currentLine) {
        saveHistory();
        currentLine = null;
      }
    };

    const transformTool = new paper.Tool();
    transformTool.name = 'transform';

    transformTool.onMouseDrag = (event) => {
      const selectedItems = projectRef.current.selectedItems;
      if (selectedItems.length === 0) return;

      const center = selectedItems.reduce((acc, item) => acc.add(item.bounds.center), new paper.Point(0, 0)).divide(selectedItems.length);
      if (event.modifiers.shift) {
        const angle = event.delta.x;
        selectedItems.forEach((item) => item.rotate(angle, center));
      } else {
        const factor = 1 + event.delta.y / 250;
        selectedItems.forEach((item) => item.scale(factor, center));
      }
    };

    transformTool.onMouseUp = () => {
      saveHistory();
    };

    toolRefs.current = {
      select: selectionTool,
      pen: penTool,
      rect: rectTool,
      circle: circleTool,
      line: lineTool,
      transform: transformTool,
    };

    selectionTool.activate();
    setActiveToolState('select');

    const handleWheel = (event) => {
      event.preventDefault();
      const zoomDelta = event.deltaY < 0 ? 1.12 : 0.88;
      const newZoom = Math.min(Math.max(paper.view.zoom * zoomDelta, 0.12), 10);
      paper.view.zoom = newZoom;
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedItem) {
          selectedItem.remove();
          setSelectedItem(null);
          saveHistory();
        }
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
      }
      if ((event.metaKey || event.ctrlKey) && (event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z'))) {
        event.preventDefault();
        redo();
      }
      if (event.key === 'Escape') {
        projectRef.current.deselectAll();
        setSelectedItem(null);
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    saveHistory();

    const initialRect = new paper.Path.Rectangle({
      point: [100, 100],
      size: [240, 160],
      strokeColor: '#ffffff',
      fillColor: '#3b82f6',
      strokeWidth: 2,
      radius: 12,
    });
    initialRect.name = 'Initial Rectangle';
    saveHistory();

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      paper.project.remove();
    };
  }, [saveHistory, undo, redo]);

  const setTool = useCallback((toolName) => {
    setActiveToolState(toolName);
    const tool = toolRefs.current[toolName];
    if (tool) {
      tool.activate();
    }
  }, []);

  const updateSelectedStyle = useCallback((style) => {
    if (selectedItem) {
      if (style.strokeColor !== undefined) {
        selectedItem.strokeColor = style.strokeColor;
        setStrokeColor(style.strokeColor);
      }
      if (style.fillColor !== undefined) {
        selectedItem.fillColor = style.fillColor === 'transparent' ? 'transparent' : style.fillColor;
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
    const selected = projectRef.current.selectedItems;
    if (selected.length < 2) return;

    let result = selected[0];
    for (let i = 1; i < selected.length; i += 1) {
      const next = selected[i];
      const newResult = result[operation](next);
      result.remove();
      next.remove();
      result = newResult;
    }

    if (result) {
      result.selected = true;
      setSelectedItem(result);
    }
    saveHistory();
  }, [saveHistory]);

  const deleteSelected = useCallback(() => {
    if (selectedItem) {
      selectedItem.remove();
      setSelectedItem(null);
      saveHistory();
    }
  }, [selectedItem, saveHistory]);

  const applyAI = useCallback((prompt) => {
    if (!projectRef.current) return;

    const items = projectRef.current.selectedItems.length > 0
      ? projectRef.current.selectedItems
      : projectRef.current.activeLayer.children;

    if (items.length === 0) return;

    const p = prompt.toLowerCase();

    items.forEach((item) => {
      if (p.includes('synthwave') || p.includes('sunset')) {
        item.fillColor = {
          gradient: {
            stops: [['#ff0080', 0.05], ['#7928ca', 0.5], ['#ff0080', 0.95]],
          },
          origin: item.bounds.topCenter,
          destination: item.bounds.bottomCenter,
        };
        item.strokeColor = '#00f2ff';
      } else if (p.includes('minimalist') || p.includes('line')) {
        item.fillColor = 'transparent';
        item.strokeColor = '#ffffff';
        item.strokeWidth = 1;
      } else if (p.includes('liquid') || p.includes('gradient')) {
        item.fillColor = {
          gradient: {
            stops: [['#4facfe', 0], ['#00f2fe', 1]],
            radial: true,
          },
          origin: item.bounds.center,
          destination: item.bounds.rightCenter,
        };
      } else if (p.includes('brutalism')) {
        item.fillColor = '#ff3e00';
        item.strokeColor = '#000000';
        item.strokeWidth = 4;
        item.shadowColor = '#000000';
        item.shadowBlur = 0;
        item.shadowOffset = new paper.Point(5, 5);
      } else {
        item.fillColor = paper.Color.random();
      }
    });

    saveHistory();
  }, [saveHistory]);

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
    applyAI,
    projectUpdated,
    paper,
  };
};
