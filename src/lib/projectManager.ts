import { GameProject, GameScene, GameObject } from './context/GameContext';

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function createNewProject(template: string): GameProject {
  const projectId = generateId();
  const sceneId = generateId();
  
  const baseProject: GameProject = {
    id: projectId,
    name: `New ${template.charAt(0).toUpperCase() + template.slice(1)} Game`,
    description: `A new ${template} game created with Game Builder Studio`,
    type: template as any,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    scenes: [],
    activeSceneId: sceneId,
    assets: [],
    settings: {
      canvasWidth: 1024,
      canvasHeight: 576,
      gravity: 800,
      gridSize: 32,
      showGrid: true,
      snapToGrid: true,
      backgroundColor: '#1e293b'
    }
  };

  // Create template-specific scenes and objects
  switch (template) {
    case 'platformer':
      baseProject.scenes = [createPlatformerScene(sceneId)];
      break;
    case 'rpg':
      baseProject.scenes = [createRPGScene(sceneId)];
      break;
    case 'puzzle':
      baseProject.scenes = [createPuzzleScene(sceneId)];
      break;
    case 'shooter':
      baseProject.scenes = [createShooterScene(sceneId)];
      break;
    default:
      baseProject.scenes = [createEmptyScene(sceneId)];
  }

  return baseProject;
}

function createEmptyScene(id: string): GameScene {
  return {
    id,
    name: 'Main Scene',
    width: 1024,
    height: 576,
    backgroundColor: '#1e293b',
    objects: [],
    layers: ['background', 'objects', 'ui']
  };
}

function createPlatformerScene(id: string): GameScene {
  const scene = createEmptyScene(id);
  scene.name = 'Platformer Level';
  
  // Add ground platforms
  scene.objects.push(
    createGameObject('platform', 'Ground', 0, 480, 1024, 96, { color: '#10b981' }),
    createGameObject('platform', 'Platform 1', 200, 380, 150, 32, { color: '#10b981' }),
    createGameObject('platform', 'Platform 2', 450, 280, 150, 32, { color: '#10b981' }),
    createGameObject('platform', 'Platform 3', 700, 180, 150, 32, { color: '#10b981' }),
    
    // Add player
    createGameObject('player', 'Player', 100, 400, 32, 48, { 
      color: '#3b82f6',
      speed: 200,
      jumpPower: 400,
      health: 100
    }),
    
    // Add collectibles
    createGameObject('collectible', 'Coin 1', 275, 340, 24, 24, { 
      color: '#fbbf24',
      points: 10,
      type: 'coin'
    }),
    createGameObject('collectible', 'Coin 2', 525, 240, 24, 24, { 
      color: '#fbbf24',
      points: 10,
      type: 'coin'
    }),
    
    // Add enemy
    createGameObject('enemy', 'Goomba', 600, 432, 32, 32, { 
      color: '#ef4444',
      health: 50,
      speed: 50,
      damage: 25
    })
  );
  
  return scene;
}

function createRPGScene(id: string): GameScene {
  const scene = createEmptyScene(id);
  scene.name = 'RPG World';
  scene.backgroundColor = '#166534';
  
  // Add player
  scene.objects.push(
    createGameObject('player', 'Hero', 512, 288, 32, 32, { 
      color: '#3b82f6',
      speed: 150,
      health: 100,
      mana: 50,
      level: 1
    }),
    
    // Add NPCs
    createGameObject('enemy', 'Villager', 200, 200, 32, 32, { 
      color: '#10b981',
      health: 100,
      type: 'npc',
      dialogue: 'Welcome to our village!'
    }),
    
    // Add trees/obstacles
    createGameObject('platform', 'Tree 1', 100, 100, 48, 64, { color: '#166534' }),
    createGameObject('platform', 'Tree 2', 300, 150, 48, 64, { color: '#166534' }),
    createGameObject('platform', 'Rock', 450, 400, 64, 48, { color: '#6b7280' }),
    
    // Add collectibles
    createGameObject('collectible', 'Potion', 600, 300, 24, 24, { 
      color: '#ec4899',
      type: 'health_potion',
      healing: 50
    })
  );
  
  return scene;
}

function createPuzzleScene(id: string): GameScene {
  const scene = createEmptyScene(id);
  scene.name = 'Puzzle Grid';
  scene.backgroundColor = '#1e1b4b';
  
  // Create a 8x6 grid of puzzle pieces
  const gridWidth = 8;
  const gridHeight = 6;
  const tileSize = 64;
  const startX = 128;
  const startY = 64;
  
  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
  
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const colorIndex = Math.floor(Math.random() * colors.length);
      scene.objects.push(
        createGameObject(
          'collectible', 
          `Tile ${x}-${y}`, 
          startX + x * tileSize, 
          startY + y * tileSize, 
          tileSize - 4, 
          tileSize - 4,
          { 
            color: colors[colorIndex],
            type: 'puzzle_tile',
            gridX: x,
            gridY: y
          }
        )
      );
    }
  }
  
  return scene;
}

function createShooterScene(id: string): GameScene {
  const scene = createEmptyScene(id);
  scene.name = 'Space Battlefield';
  scene.backgroundColor = '#0f172a';
  
  // Add player ship
  scene.objects.push(
    createGameObject('player', 'Player Ship', 100, 288, 48, 32, { 
      color: '#3b82f6',
      speed: 250,
      health: 100,
      fireRate: 0.5,
      weaponType: 'laser'
    }),
    
    // Add enemy ships
    createGameObject('enemy', 'Enemy 1', 600, 150, 32, 24, { 
      color: '#ef4444',
      health: 30,
      speed: 100,
      fireRate: 1.0
    }),
    createGameObject('enemy', 'Enemy 2', 700, 300, 32, 24, { 
      color: '#ef4444',
      health: 30,
      speed: 120,
      fireRate: 0.8
    }),
    createGameObject('enemy', 'Boss Ship', 800, 200, 64, 48, { 
      color: '#7c2d12',
      health: 200,
      speed: 50,
      fireRate: 2.0,
      type: 'boss'
    }),
    
    // Add power-ups
    createGameObject('collectible', 'Shield Boost', 400, 100, 24, 24, { 
      color: '#06b6d4',
      type: 'shield',
      duration: 10000
    }),
    createGameObject('collectible', 'Weapon Upgrade', 300, 450, 24, 24, { 
      color: '#f59e0b',
      type: 'weapon_upgrade',
      upgradeLevel: 1
    })
  );
  
  return scene;
}

function createGameObject(
  type: GameObject['type'], 
  name: string, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  properties: Record<string, any> = {}
): GameObject {
  return {
    id: generateId(),
    type,
    name,
    x,
    y,
    width,
    height,
    properties,
    color: properties.color || '#3b82f6',
    visible: true,
    locked: false
  };
}

export function loadProject(id: string): GameProject | null {
  try {
    const savedProjects = JSON.parse(localStorage.getItem('gameProjects') || '[]');
    return savedProjects.find((p: GameProject) => p.id === id) || null;
  } catch (error) {
    console.error('Failed to load project:', error);
    return null;
  }
}

export function saveProject(project: GameProject): void {
  try {
    const savedProjects = JSON.parse(localStorage.getItem('gameProjects') || '[]');
    const existingIndex = savedProjects.findIndex((p: GameProject) => p.id === project.id);
    
    const updatedProject = {
      ...project,
      lastModified: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      savedProjects[existingIndex] = updatedProject;
    } else {
      savedProjects.push(updatedProject);
    }
    
    localStorage.setItem('gameProjects', JSON.stringify(savedProjects));
  } catch (error) {
    console.error('Failed to save project:', error);
    throw error;
  }
}

export function deleteProject(id: string): void {
  try {
    const savedProjects = JSON.parse(localStorage.getItem('gameProjects') || '[]');
    const filteredProjects = savedProjects.filter((p: GameProject) => p.id !== id);
    localStorage.setItem('gameProjects', JSON.stringify(filteredProjects));
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw error;
  }
}

export function getAllProjects(): GameProject[] {
  try {
    return JSON.parse(localStorage.getItem('gameProjects') || '[]');
  } catch (error) {
    console.error('Failed to load projects:', error);
    return [];
  }
}