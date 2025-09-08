"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface GameObject {
  id: string;
  type: 'player' | 'enemy' | 'platform' | 'collectible' | 'background';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: Record<string, any>;
  sprite?: string;
  color?: string;
  visible: boolean;
  locked: boolean;
}

export interface GameScene {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  objects: GameObject[];
  layers: string[];
}

export interface GameProject {
  id: string;
  name: string;
  description: string;
  type: 'platformer' | 'rpg' | 'puzzle' | 'shooter';
  createdAt: string;
  lastModified: string;
  scenes: GameScene[];
  activeSceneId: string;
  assets: GameAsset[];
  settings: GameSettings;
}

export interface GameAsset {
  id: string;
  name: string;
  type: 'sprite' | 'sound' | 'background' | 'tileset';
  url: string;
  width?: number;
  height?: number;
  properties: Record<string, any>;
}

export interface GameSettings {
  canvasWidth: number;
  canvasHeight: number;
  gravity: number;
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
  backgroundColor: string;
}

export interface EditorState {
  selectedObjectId: string | null;
  tool: 'select' | 'move' | 'draw' | 'erase';
  showGrid: boolean;
  showColliders: boolean;
  zoom: number;
  panX: number;
  panY: number;
  isPlaying: boolean;
}

export interface GameState {
  currentProject: GameProject | null;
  projects: GameProject[];
  editor: EditorState;
  assets: GameAsset[];
  isLoading: boolean;
  error: string | null;
}

// Actions
type GameAction = 
  | { type: 'SET_PROJECT'; payload: GameProject }
  | { type: 'UPDATE_PROJECT'; payload: Partial<GameProject> }
  | { type: 'ADD_PROJECT'; payload: GameProject }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_PROJECTS'; payload: GameProject[] }
  | { type: 'ADD_OBJECT'; payload: { sceneId: string; object: GameObject } }
  | { type: 'UPDATE_OBJECT'; payload: { sceneId: string; objectId: string; updates: Partial<GameObject> } }
  | { type: 'DELETE_OBJECT'; payload: { sceneId: string; objectId: string } }
  | { type: 'SELECT_OBJECT'; payload: string | null }
  | { type: 'SET_TOOL'; payload: EditorState['tool'] }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN'; payload: { x: number; y: number } }
  | { type: 'TOGGLE_GRID' }
  | { type: 'TOGGLE_COLLIDERS' }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'ADD_ASSET'; payload: GameAsset }
  | { type: 'DELETE_ASSET'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Initial state
const initialState: GameState = {
  currentProject: null,
  projects: [],
  editor: {
    selectedObjectId: null,
    tool: 'select',
    showGrid: true,
    showColliders: false,
    zoom: 1,
    panX: 0,
    panY: 0,
    isPlaying: false,
  },
  assets: [],
  isLoading: false,
  error: null,
};

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, currentProject: action.payload };
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        currentProject: state.currentProject ? {
          ...state.currentProject,
          ...action.payload,
          lastModified: new Date().toISOString(),
        } : null,
      };
    
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload],
      };
    
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        currentProject: state.currentProject?.id === action.payload ? null : state.currentProject,
      };
    
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    
    case 'ADD_OBJECT':
      if (!state.currentProject) return state;
      return {
        ...state,
        currentProject: {
          ...state.currentProject,
          scenes: state.currentProject.scenes.map(scene =>
            scene.id === action.payload.sceneId
              ? { ...scene, objects: [...scene.objects, action.payload.object] }
              : scene
          ),
        },
      };
    
    case 'UPDATE_OBJECT':
      if (!state.currentProject) return state;
      return {
        ...state,
        currentProject: {
          ...state.currentProject,
          scenes: state.currentProject.scenes.map(scene =>
            scene.id === action.payload.sceneId
              ? {
                  ...scene,
                  objects: scene.objects.map(obj =>
                    obj.id === action.payload.objectId
                      ? { ...obj, ...action.payload.updates }
                      : obj
                  ),
                }
              : scene
          ),
        },
      };
    
    case 'DELETE_OBJECT':
      if (!state.currentProject) return state;
      return {
        ...state,
        currentProject: {
          ...state.currentProject,
          scenes: state.currentProject.scenes.map(scene =>
            scene.id === action.payload.sceneId
              ? {
                  ...scene,
                  objects: scene.objects.filter(obj => obj.id !== action.payload.objectId),
                }
              : scene
          ),
        },
        editor: {
          ...state.editor,
          selectedObjectId: state.editor.selectedObjectId === action.payload.objectId 
            ? null 
            : state.editor.selectedObjectId,
        },
      };
    
    case 'SELECT_OBJECT':
      return {
        ...state,
        editor: { ...state.editor, selectedObjectId: action.payload },
      };
    
    case 'SET_TOOL':
      return {
        ...state,
        editor: { ...state.editor, tool: action.payload },
      };
    
    case 'SET_ZOOM':
      return {
        ...state,
        editor: { ...state.editor, zoom: action.payload },
      };
    
    case 'SET_PAN':
      return {
        ...state,
        editor: { ...state.editor, panX: action.payload.x, panY: action.payload.y },
      };
    
    case 'TOGGLE_GRID':
      return {
        ...state,
        editor: { ...state.editor, showGrid: !state.editor.showGrid },
      };
    
    case 'TOGGLE_COLLIDERS':
      return {
        ...state,
        editor: { ...state.editor, showColliders: !state.editor.showColliders },
      };
    
    case 'TOGGLE_PLAY':
      return {
        ...state,
        editor: { ...state.editor, isPlaying: !state.editor.isPlaying },
      };
    
    case 'ADD_ASSET':
      return {
        ...state,
        assets: [...state.assets, action.payload],
      };
    
    case 'DELETE_ASSET':
      return {
        ...state,
        assets: state.assets.filter(a => a.id !== action.payload),
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    default:
      return state;
  }
}

// Context
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

// Provider
export function GameContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// Hook
export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameContextProvider');
  }
  return context;
}