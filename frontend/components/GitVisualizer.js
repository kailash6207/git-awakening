import React, { useEffect, useRef } from 'react';
import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';

export default function GitVisualizer({ onSelectCommit, refreshTrigger }) {
  const containerRef = useRef();
  const graphInstance = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize the 3D Force Graph engine
    const Graph = ForceGraph3D()(containerRef.current)
      .nodeLabel(node => `[REALM LAYER]: ${node.label}\nTech Core: ${node.language}`)
      .nodeThreeObject(node => {
        // Build the stylized geometric artifact meshes (Octahedron + Glowing Ring)
        const group = new THREE.Group();
        const radius = Math.min(6 + Math.log10(node.size || 10) * 1.5, 15);
        
        const crystalGeo = new THREE.OctahedronGeometry(radius, 0); 
        const crystalMat = new THREE.MeshStandardMaterial({
          color: node.color || '#38bdf8',
          emissive: node.color || '#38bdf8',
          emissiveIntensity: 2.2, 
          roughness: 0.1,
          metalness: 0.9,
          flatShading: true
        });
        const crystal = new THREE.Mesh(crystalGeo, crystalMat);
        group.add(crystal);

        const ringGeo = new THREE.RingGeometry(radius + 4, radius + 5, 32);
        const ringMat = new THREE.MeshBasicMaterial({ 
          color: node.color || '#38bdf8', 
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.4
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2; // Keep rings oriented flat relative to ground grid
        group.add(ring);

        return group;
      })
      .linkWidth(2.5) // Slightly thickened for increased tactical visibility
      .linkColor(() => '#38bdf8') // Changed from dim #1e293b to bright cyber blue vector links
      .linkDirectionalParticles(6) // Increased node flow particles
      .linkDirectionalParticleWidth(3.5)
      .linkDirectionalParticleSpeed(0.012)
      .onNodeClick((node) => {
        onSelectCommit(node);
      });

    // 3D Environment Calibration
    const scene = Graph.scene();
    scene.background = new THREE.Color('#02040a');

    // HIGH VISIBILITY TACTICAL FLOOR GRID MATRICES
    // Primary axes set to radiant blue (#0284c7), sub-grids set to deep neon navy (#0c4a6e)
    const gridHelper = new THREE.GridHelper(1200, 60, '#0284c7', '#0c4a6e');
    gridHelper.position.y = -120; 
    
    // Boost material luminosity for the grid lines
    if (gridHelper.material) {
      gridHelper.material.opacity = 0.6;
      gridHelper.material.transparent = true;
    }
    scene.add(gridHelper);

    // Fine-tune charge forces to allow organic clustering while maintaining separations
    Graph.d3Force('charge').strength(-50);
    Graph.d3Force('link').distance(75);

    graphInstance.current = Graph;

    // Fetch matrix data from backend endpoint
    fetch('http://localhost:8585/api/portfolio')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP Error Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const safeData = {
          nodes: data && Array.isArray(data.nodes) ? data.nodes : [],
          links: data && Array.isArray(data.links) ? data.links : []
        };

        // VERTICAL TIER HEIGHT LOCKING
        safeData.nodes.forEach((node) => {
          if (node.size > 5000) {
            node.fy = 90;   // S-Rank Peak Layer
          } else if (node.size > 500) {
            node.fy = 10;   // A-Rank Mid Layer
          } else {
            node.fy = -70;  // B-Rank Base Layer
          }
        });

        Graph.graphData(safeData);
        
        // Calibrate structural entry camera viewpoint position
        Graph.cameraPosition(
          { x: 220, y: 140, z: 320 }, 
          { x: 0, y: 10, z: 0 },
          1200
        );
      })
      .catch(err => console.error("Ecosystem arena configuration crash:", err));

    // Handle viewport browser scaling operations automatically
    const handleResize = () => {
      if (graphInstance.current && containerRef.current) {
        Graph.width(containerRef.current.clientWidth);
        Graph.height(containerRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Clean up memory allocations on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (graphInstance.current && containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [onSelectCommit, refreshTrigger]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        background: '#02040a',
        position: 'absolute',
        top: 0,
        left: 0
      }} 
    />
  );
}