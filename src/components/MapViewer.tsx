import React, { useEffect, useRef, useState, useCallback } from 'react';
import panzoom, { PanZoom } from 'panzoom';
import { PathResult, GraphNode } from '@/lib/pathfinding';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface MapViewerProps {
  pathResult: PathResult | null;
  startNode: GraphNode | null;
  endNode: GraphNode | null;
  nodes: GraphNode[];
}

export function MapViewer({ pathResult, startNode, endNode, nodes }: MapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const panzoomInstance = useRef<PanZoom | null>(null);

  // Load SVG
  useEffect(() => {
    async function loadSvg() {
      try {
        const response = await fetch('/map.svg');
        const text = await response.text();
        // Clean up namespace prefixes for browser compatibility
        const cleanedSvg = text
          .replace(/ns0:/g, '')
          .replace(/xmlns:ns0/g, 'xmlns');
        setSvgContent(cleanedSvg);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load SVG:', err);
        setIsLoading(false);
      }
    }
    loadSvg();
  }, []);

  // Initialize panzoom
  useEffect(() => {
    if (!svgContainerRef.current || isLoading) return;

    const svg = svgContainerRef.current.querySelector('svg');
    if (!svg) return;

    // Initialize panzoom
    panzoomInstance.current = panzoom(svg, {
      maxZoom: 5,
      minZoom: 0.3,
      initialZoom: 0.4,
      bounds: true,
      boundsPadding: 0.1,
      smoothScroll: false
    });

    // Center the map initially
    const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
    const containerHeight = containerRef.current?.clientHeight || window.innerHeight;

    setTimeout(() => {
      panzoomInstance.current?.moveTo(
        containerWidth / 2 - 2490 * 0.4,
        containerHeight / 2 - 2731 * 0.4
      );
    }, 100);

    return () => {
      panzoomInstance.current?.dispose();
    };
  }, [isLoading, svgContent]);

  // Draw path overlay
  useEffect(() => {
    if (!svgContainerRef.current || !pathResult) return;

    const svg = svgContainerRef.current.querySelector('svg');
    if (!svg) return;

    // Remove existing path overlay and any comet styles
    const existingOverlay = svg.querySelector('#path-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Clean up old comet styles
    document.querySelectorAll('[id^="comet-style-"]').forEach(el => el.remove());

    // Create path overlay group
    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    overlay.id = 'path-overlay';

    // Create path string from coordinates
    const pathD = pathResult.coordinates
      .map((coord, i) => `${i === 0 ? 'M' : 'L'} ${coord.x} ${coord.y}`)
      .join(' ');

    const pathLength = 5000; // Large value for initial dasharray if needed, but we'll use actual length

    // Glow effect path (wider, blurred) - static background
    const glowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    glowPath.setAttribute('d', pathD);
    glowPath.setAttribute('fill', 'none');
    glowPath.setAttribute('stroke', 'hsl(190, 100%, 60%)');
    glowPath.setAttribute('stroke-width', '25');
    glowPath.setAttribute('stroke-linecap', 'round');
    glowPath.setAttribute('stroke-linejoin', 'round');
    glowPath.setAttribute('opacity', '0.2');
    glowPath.setAttribute('filter', 'blur(8px)');

    // Main path - static background
    const mainPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    mainPath.setAttribute('d', pathD);
    mainPath.setAttribute('fill', 'none');
    mainPath.setAttribute('stroke', 'hsl(190, 100%, 55%)');
    mainPath.setAttribute('stroke-width', '12');
    mainPath.setAttribute('stroke-linecap', 'round');
    mainPath.setAttribute('stroke-linejoin', 'round');
    mainPath.setAttribute('opacity', '0.4');

    // Add static paths
    overlay.appendChild(glowPath);
    overlay.appendChild(mainPath);

    // Get actual path length for comet animation
    // Temporarily add to SVG to measure
    svg.appendChild(overlay);
    const actualLength = mainPath.getTotalLength();

    // Create Comet effect
    const comet = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    comet.setAttribute('d', pathD);
    comet.setAttribute('fill', 'none');
    comet.setAttribute('stroke', 'white');
    comet.setAttribute('stroke-width', '14');
    comet.setAttribute('stroke-linecap', 'round');
    comet.setAttribute('stroke-linejoin', 'round');
    comet.style.filter = 'drop-shadow(0 0 12px hsl(190, 100%, 80%))';

    const cometHeadLength = Math.min(actualLength * 0.1, 80);
    comet.style.strokeDasharray = `${cometHeadLength} ${actualLength}`;

    // Create unique animation
    const animId = `comet-anim-${Math.random().toString(36).substr(2, 9)}`;
    const styleId = `comet-style-${animId}`;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes ${animId} {
        0% { stroke-dashoffset: ${actualLength + cometHeadLength}; }
        100% { stroke-dashoffset: 0; }
      }
    `;
    document.head.appendChild(style);

    comet.style.animation = `${animId} 3s linear infinite`;
    overlay.appendChild(comet);

    // Start marker
    if (pathResult.coordinates.length > 0) {
      const startCoord = pathResult.coordinates[0];
      const startMarker = createMarker(startCoord.x, startCoord.y, 'hsl(145, 80%, 45%)', '🚶');
      overlay.appendChild(startMarker);
    }

    // End marker
    if (pathResult.coordinates.length > 1) {
      const endCoord = pathResult.coordinates[pathResult.coordinates.length - 1];
      const endMarker = createMarker(endCoord.x, endCoord.y, 'hsl(0, 85%, 55%)', '📍');
      overlay.appendChild(endMarker);
    }

  }, [pathResult]);

  // Create SVG marker element
  function createMarker(x: number, y: number, color: string, emoji: string): SVGGElement {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${x}, ${y})`);

    // Pulsing ring
    const pulseRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pulseRing.setAttribute('r', '35');
    pulseRing.setAttribute('fill', color);
    pulseRing.setAttribute('opacity', '0.3');
    pulseRing.innerHTML = `<animate attributeName="r" values="30;45;30" dur="2s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>`;

    // Main circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', '25');
    circle.setAttribute('fill', color);
    circle.setAttribute('stroke', 'white');
    circle.setAttribute('stroke-width', '4');

    // Emoji text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('font-size', '24');
    text.textContent = emoji;

    g.appendChild(pulseRing);
    g.appendChild(circle);
    g.appendChild(text);

    return g;
  }

  // Clear path overlay
  useEffect(() => {
    if (!pathResult && svgContainerRef.current) {
      const svg = svgContainerRef.current.querySelector('svg');
      if (svg) {
        const overlay = svg.querySelector('#path-overlay');
        if (overlay) {
          overlay.remove();
        }
      }
    }
  }, [pathResult]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (panzoomInstance.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      panzoomInstance.current.smoothZoom(cx, cy, 1.5);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (panzoomInstance.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      panzoomInstance.current.smoothZoom(cx, cy, 0.67);
    }
  }, []);

  const handleReset = useCallback(() => {
    if (panzoomInstance.current && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      panzoomInstance.current.zoomAbs(0, 0, 0.4);
      panzoomInstance.current.moveTo(
        containerWidth / 2 - 2490 * 0.4,
        containerHeight / 2 - 2731 * 0.4
      );
    }
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading campus map...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#1E1E1E] overflow-hidden">
      {/* Map Container */}
      <div
        ref={svgContainerRef}
        className="map-container w-full h-full"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-muted transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-muted transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={handleReset}
          className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-muted transition-colors"
          title="Reset view"
        >
          <Maximize className="w-5 h-5 text-foreground" />
        </button>
      </div>
    </div>
  );
}
