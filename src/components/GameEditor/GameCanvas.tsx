"use client";

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GameScene, GameObject, useGameContext } from '@/lib/context/GameContext';

interface GameCanvasProps {
  scene: GameScene;
}

export function GameCanvas({ scene }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, dispatch } = useGameContext();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedObject, setSelectedObject] = useState<GameObject | null>(null);

  // Convert screen coordinates to world coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const x = ((screenX - rect.left) / state.editor.zoom) - state.editor.panX;
    const y = ((screenY - rect.top) / state.editor.zoom) - state.editor.panY;
    
    return { x, y };
  }, [state.editor.zoom, state.editor.panX, state.editor.panY]);

  // Find object at position
  const getObjectAtPosition = useCallback((x: number, y: number): GameObject | null => {
    // Check objects in reverse order (top to bottom)
    for (let i = scene.objects.length - 1; i >= 0; i--) {
      const obj = scene.objects[i];
      if (!obj.visible || obj.locked) continue;
      
      if (x >= obj.x && x <= obj.x + obj.width &&
          y >= obj.y && y <= obj.y + obj.height) {
        return obj;
      }
    }
    return null;
  }, [scene.objects]);

  // Handle mouse down
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    const { x, y } = screenToWorld(event.clientX, event.clientY);
    
    const clickedObject = getObjectAtPosition(x, y);
    
    if (clickedObject) {
      setSelectedObject(clickedObject);
      dispatch({ type: 'SELECT_OBJECT', payload: clickedObject.id });
      setIsDragging(true);
      setDragStart({ x: x - clickedObject.x, y: y - clickedObject.y });
    } else {
      setSelectedObject(null);
      dispatch({ type: 'SELECT_OBJECT', payload: null });
    }
  }, [screenToWorld, getObjectAtPosition, dispatch]);

  // Handle mouse move
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging || !selectedObject) return;
    
    const { x, y } = screenToWorld(event.clientX, event.clientY);
    const newX = x - dragStart.x;
    const newY = y - dragStart.y;
    
    // Snap to grid if enabled
    const finalX = state.currentProject?.settings.snapToGrid 
      ? Math.round(newX / state.currentProject.settings.gridSize) * state.currentProject.settings.gridSize
      : newX;
    const finalY = state.currentProject?.settings.snapToGrid
      ? Math.round(newY / state.currentProject.settings.gridSize) * state.currentProject.settings.gridSize
      : newY;
    
    dispatch({
      type: 'UPDATE_OBJECT',
      payload: {
        sceneId: scene.id,
        objectId: selectedObject.id,
        updates: { x: finalX, y: finalY }
      }
    });
  }, [isDragging, selectedObject, screenToWorld, dragStart, dispatch, scene.id, state.currentProject]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart({ x: 0, y: 0 });
  }, []);

  // Handle mouse wheel for zooming
  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.1, Math.min(3, state.editor.zoom + delta));
    dispatch({ type: 'SET_ZOOM', payload: newZoom });
  }, [state.editor.zoom, dispatch]);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context
    ctx.save();
    
    // Apply zoom and pan
    ctx.scale(state.editor.zoom, state.editor.zoom);
    ctx.translate(state.editor.panX, state.editor.panY);
    
    // Draw background
    ctx.fillStyle = scene.backgroundColor;
    ctx.fillRect(0, 0, scene.width, scene.height);
    
    // Draw grid if enabled
    if (state.editor.showGrid && state.currentProject) {
      drawGrid(ctx, scene, state.currentProject.settings.gridSize);
    }
    
    // Draw objects
    scene.objects.forEach(obj => {
      if (!obj.visible) return;
      drawGameObject(ctx, obj, obj.id === state.editor.selectedObjectId);
    });
    
    // Draw collision boxes if enabled
    if (state.editor.showColliders) {
      scene.objects.forEach(obj => {
        if (!obj.visible) return;
        drawCollisionBox(ctx, obj);
      });
    }
    
    // Restore context
    ctx.restore();
  }, [scene, state.editor, state.currentProject]);

  // Draw grid
  const drawGrid = (ctx: CanvasRenderingContext2D, scene: GameScene, gridSize: number) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= scene.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, scene.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= scene.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(scene.width, y);
      ctx.stroke();
    }
  };

  // Draw game object
  const drawGameObject = (ctx: CanvasRenderingContext2D, obj: GameObject, isSelected: boolean) => {
    // Draw object
    ctx.fillStyle = obj.color || obj.properties.color || '#3b82f6';
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    
    // Draw object type indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    const typeText = obj.type.toUpperCase();
    ctx.fillText(typeText, obj.x + obj.width / 2, obj.y + obj.height / 2 + 4);
    
    // Draw selection outline
    if (isSelected) {
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(obj.x - 2, obj.y - 2, obj.width + 4, obj.height + 4);
      ctx.setLineDash([]);
      
      // Draw resize handles
      const handleSize = 6;
      ctx.fillStyle = '#60a5fa';
      
      // Corner handles
      const corners = [
        { x: obj.x - handleSize/2, y: obj.y - handleSize/2 },
        { x: obj.x + obj.width - handleSize/2, y: obj.y - handleSize/2 },
        { x: obj.x - handleSize/2, y: obj.y + obj.height - handleSize/2 },
        { x: obj.x + obj.width - handleSize/2, y: obj.y + obj.height - handleSize/2 }
      ];
      
      corners.forEach(corner => {
        ctx.fillRect(corner.x, corner.y, handleSize, handleSize);
      });
    }
  };

  // Draw collision box
  const drawCollisionBox = (ctx: CanvasRenderingContext2D, obj: GameObject) => {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
    ctx.setLineDash([]);
  };

  // Set up canvas and render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Initial render
    render();
    
    // Set up render loop for smooth updates
    const animate = () => {
      render();
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      render();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [render]);

  return (
    <div className="h-full w-full overflow-hidden bg-gray-800 relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {/* Canvas Info Overlay */}
      <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
        Zoom: {Math.round(state.editor.zoom * 100)}% | Objects: {scene.objects.length}
        {state.editor.selectedObjectId && (
          <span className="ml-2">| Selected: {scene.objects.find(o => o.id === state.editor.selectedObjectId)?.name}</span>
        )}
      </div>
      
      {/* Grid Toggle */}
      <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
        Grid: {state.editor.showGrid ? 'ON' : 'OFF'} | 
        Colliders: {state.editor.showColliders ? 'ON' : 'OFF'}
      </div>
    </div>
  );
}