"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Play, Settings, Folder } from "lucide-react";

export default function DashboardPage() {
  const recentProjects = [
    {
      id: "1",
      name: "Mystic Adventure",
      type: "RPG",
      lastModified: "2 hours ago",
      thumbnail: "https://placehold.co/300x200?text=Mystic+Adventure+RPG+game+with+fantasy+characters+and+magical+landscapes",
      status: "In Progress"
    },
    {
      id: "2", 
      name: "Space Runner",
      type: "Platformer",
      lastModified: "1 day ago",
      thumbnail: "https://placehold.co/300x200?text=Space+Runner+platformer+game+with+astronaut+character+and+alien+planets",
      status: "Complete"
    },
    {
      id: "3",
      name: "Puzzle Quest",
      type: "Puzzle",
      lastModified: "3 days ago", 
      thumbnail: "https://placehold.co/300x200?text=Puzzle+Quest+colorful+match+three+game+with+gems+and+magical+effects",
      status: "In Progress"
    }
  ];

  const gameTemplates = [
    {
      name: "Platformer",
      description: "Classic side-scrolling platform game with jumping mechanics",
      image: "https://placehold.co/400x250?text=Platformer+Template+with+character+jumping+on+platforms+and+obstacles",
      difficulty: "Beginner"
    },
    {
      name: "RPG Adventure", 
      description: "Top-down role-playing game with quests and character progression",
      image: "https://placehold.co/400x250?text=RPG+Adventure+Template+with+fantasy+world+map+and+character+sprites",
      difficulty: "Intermediate"
    },
    {
      name: "Puzzle Game",
      description: "Grid-based puzzle mechanics with match-three gameplay",
      image: "https://placehold.co/400x250?text=Puzzle+Game+Template+with+colorful+tiles+and+matching+mechanics",
      difficulty: "Beginner"
    },
    {
      name: "Space Shooter",
      description: "Classic arcade-style space shooter with enemies and power-ups", 
      image: "https://placehold.co/400x250?text=Space+Shooter+Template+with+spaceship+and+enemy+fighters+in+space",
      difficulty: "Advanced"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Game Builder Studio
              </h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/projects" className="text-gray-300 hover:text-white transition-colors">
                Projects
              </Link>
              <Link href="/editor" className="text-gray-300 hover:text-white transition-colors">
                Editor
              </Link>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">Welcome to Game Builder Studio</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Create amazing games with our intuitive visual editor. No coding required - just drag, drop, and play!
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Link href="/editor?new=true">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Plus className="w-5 h-5 mr-2" />
                Create New Game
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="outline" size="lg">
                <Folder className="w-5 h-5 mr-2" />
                Browse Projects
              </Button>
            </Link>
          </div>
        </section>

        {/* Recent Projects */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold">Recent Projects</h3>
            <Link href="/projects">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project) => (
              <Card key={project.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors group cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="aspect-video rounded-lg overflow-hidden mb-3">
                    <img 
                      src={project.thumbnail} 
                      alt={`${project.name} game screenshot`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant={project.status === "Complete" ? "default" : "secondary"}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardDescription>{project.type} • {project.lastModified}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex space-x-2">
                    <Link href={`/editor?project=${project.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Edit
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Game Templates */}
        <section>
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-2">Start with a Template</h3>
            <p className="text-gray-400">Choose from our pre-built game templates to get started quickly</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gameTemplates.map((template, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors group cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="aspect-video rounded-lg overflow-hidden mb-3">
                    <img 
                      src={template.image} 
                      alt={`${template.name} game template`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="text-sm">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      {template.difficulty}
                    </Badge>
                  </div>
                  <Link href={`/editor?template=${template.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Button className="w-full" variant="outline">
                      Use Template
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}