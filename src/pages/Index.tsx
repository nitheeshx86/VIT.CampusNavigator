import React, { useState, useCallback, useMemo } from 'react';
import { MapViewer } from '@/components/MapViewer';
import { MobileNavigation } from '@/components/MobileNavigation';
import { useGraph } from '@/hooks/useGraph';
import { findShortestPath, PathResult, GraphNode } from '@/lib/pathfinding';
import { AlertCircle } from 'lucide-react';

const Index = () => {
  const { graph, locations, loading, error } = useGraph();
  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [navigationError, setNavigationError] = useState<string | null>(null);
  const [selectedStart, setSelectedStart] = useState<GraphNode | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<GraphNode | null>(null);

  const handleNavigate = useCallback((startId: string, endId: string) => {
    if (!graph) return;

    setIsCalculating(true);
    setNavigationError(null);

    // Small delay for UI feedback
    setTimeout(() => {
      const startNode = graph.nodes.find(n => n.id === startId);
      const endNode = graph.nodes.find(n => n.id === endId);

      if (!startNode || !endNode) return;

      // Fun alerts for "weird" navigation
      if (startId === endId) {
        setNavigationError(`Bruh, you're already at ${startNode.name}`);
        setIsCalculating(false);
        return;
      }

      // Check if they are in the same block
      const isStartInBlock = startNode.blockId === endId;
      const isEndInBlock = endNode.blockId === startId;
      const areInSameBlock = startNode.blockId && endNode.blockId && startNode.blockId === endNode.blockId;

      if (isStartInBlock || isEndInBlock || areInSameBlock) {
        const floorInfo = endNode.floor ? `just in the ${endNode.floor}` : "it's just on a different floor";
        setNavigationError(`Hey, it's in the same building that you're in, ${floorInfo}`);
        setIsCalculating(false);

        // Still select the nodes so they show up on map/facts but don't show a path
        setPathResult(null);
        setSelectedStart(startNode);
        setSelectedEnd(endNode);
        return;
      }

      const result = findShortestPath(graph, startId, endId);

      if (result) {
        setPathResult(result);
        setSelectedStart(startNode);
        setSelectedEnd(endNode);
      } else {
        setNavigationError('No path found between these locations');
      }

      setIsCalculating(false);
    }, 300);
  }, [graph]);

  const handleReset = useCallback(() => {
    setPathResult(null);
    setNavigationError(null);
    setSelectedStart(null);
    setSelectedEnd(null);
  }, []);

  const allNodes = useMemo(() => graph?.nodes || [], [graph]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-lg text-muted-foreground">Loading campus data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-panel p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Failed to Load</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen bg-background overflow-hidden relative">
      {/* Full-screen Map */}
      <MapViewer
        pathResult={pathResult}
        startNode={selectedStart}
        endNode={selectedEnd}
        nodes={allNodes}
      />

      {/* Mobile Navigation UI */}
      <MobileNavigation
        locations={locations}
        onNavigate={handleNavigate}
        onReset={handleReset}
        isCalculating={isCalculating}
        selectedStart={selectedStart}
        selectedEnd={selectedEnd}
      />

      {/* Permanent Attribution */}
      <div className="fixed bottom-6 left-6 z-[100] pointer-events-auto">
        <div className="glass-panel px-3 py-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
            Made by Nitheesh. Know More
          </p>
        </div>
      </div>

      {/* Error Toast */}
      {navigationError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up w-[calc(100%-2rem)] max-w-sm">
          <div className="glass-panel px-4 py-3 flex items-center gap-3 border-destructive/50 bg-destructive/10">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-foreground flex-1">{navigationError}</p>
            <button
              onClick={() => setNavigationError(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
