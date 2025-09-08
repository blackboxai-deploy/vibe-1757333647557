"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useGameContext } from "@/lib/context/GameContext";
import { GameCanvas } from "@/components/GameEditor/GameCanvas";
import { EditorSidebar } from "@/components/GameEditor/EditorSidebar";
import { EditorToolbar } from "@/components/GameEditor/EditorToolbar";
import { PropertyPanel } from "@/components/GameEditor/PropertyPanel";
import { AssetPanel } from "@/components/GameEditor/AssetPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { createNewProject, loadProject } from "@/lib/projectManager";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Save, Play, Pause, Settings } from "lucide-react";

export default function EditorPage() {
  const { state, dispatch } = useGameContext();
  const searchParams = useSearchParams();
  const [activePanel, setActivePanel] = useState<'properties' | 'assets'>('properties');

  // Initialize project based on URL parameters
  useEffect(() => {
    const newProject = searchParams?.get('new');
    const projectId = searchParams?.get('project');
    const template = searchParams?.get('template');

    if (newProject || template) {
      // Create new project
      const project = createNewProject(template || 'platformer');
      dispatch({ type: 'SET_PROJECT', payload: project });
      toast.success(`Created new ${template || 'platformer'} project!`);
    } else if (projectId) {
      // Load existing project
      const project = loadProject(projectId);
      if (project) {
        dispatch({ type: 'SET_PROJECT', payload: project });
        toast.success(`Loaded project: ${project.name}`);
      } else {
        toast.error('Project not found');
      }
    }
  }, [searchParams, dispatch]);

  const handleSave = () => {
    if (state.currentProject) {
      // Save project to localStorage
      const savedProjects = JSON.parse(localStorage.getItem('gameProjects') || '[]');
      const existingIndex = savedProjects.findIndex((p: any) => p.id === state.currentProject?.id);
      
      if (existingIndex >= 0) {
        savedProjects[existingIndex] = state.currentProject;
      } else {
        savedProjects.push(state.currentProject);
      }
      
      localStorage.setItem('gameProjects', JSON.stringify(savedProjects));
      toast.success('Project saved successfully!');
    }
  };

  const handlePlay = () => {
    dispatch({ type: 'TOGGLE_PLAY' });
    toast.info(state.editor.isPlaying ? 'Game stopped' : 'Game playing');
  };

  if (!state.currentProject) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Card className="p-8 bg-gray-800 border-gray-700">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Loading Editor...</h2>
            <p className="text-gray-400 mb-6">Please wait while we set up your game project.</p>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const currentScene = state.currentProject.scenes.find(s => s.id === state.currentProject?.activeSceneId);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="font-semibold text-lg">{state.currentProject.name}</h1>
                <p className="text-sm text-gray-400">{state.currentProject.type} • {currentScene?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button 
                variant={state.editor.isPlaying ? "destructive" : "default"} 
                size="sm" 
                onClick={handlePlay}
              >
                {state.editor.isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Editor Interface */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full border-r border-gray-800">
              <EditorSidebar />
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-gray-800 hover:bg-gray-700" />

          {/* Main Canvas Area */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full flex flex-col">
              {/* Toolbar */}
              <div className="border-b border-gray-800 bg-gray-900/30">
                <EditorToolbar />
              </div>
              
              {/* Canvas */}
              <div className="flex-1 overflow-hidden bg-gray-900">
                {currentScene ? (
                  <GameCanvas scene={currentScene} />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-400">No scene selected</p>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-gray-800 hover:bg-gray-700" />

          {/* Right Panel */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full border-l border-gray-800 bg-gray-900/20">
              {/* Panel Tabs */}
              <div className="border-b border-gray-800">
                <div className="flex">
                  <button
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activePanel === 'properties'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActivePanel('properties')}
                  >
                    Properties
                  </button>
                  <button
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activePanel === 'assets'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActivePanel('assets')}
                  >
                    Assets
                  </button>
                </div>
              </div>

              {/* Panel Content */}
              <div className="h-[calc(100%-57px)] overflow-auto">
                {activePanel === 'properties' ? (
                  <PropertyPanel />
                ) : (
                  <AssetPanel />
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}