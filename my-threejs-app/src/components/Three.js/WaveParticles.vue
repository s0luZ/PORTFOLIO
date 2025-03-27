<template>
    <div class="wave-particles-container"></div>
  </template>
  
  <script setup>
  import { onMounted, onBeforeUnmount } from 'vue';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
  
  let scene, camera, renderer, particles, pointCloud, controls, animationFrameId;
  
  onMounted(() => {
    initThree();
    animate();
  });
  
  onBeforeUnmount(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    if (renderer) {
      renderer.dispose();
    }
    window.removeEventListener('resize', handleResize);
  });
  
  function initThree() {
    // Scene, Camera, Renderer
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Set up camera for top-down view
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    camera.position.y = 50;
    camera.position.z = 0;
    camera.lookAt(0, 0, 0);
  
    const container = document.querySelector('.wave-particles-container');
    renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
  
    // Particle System
    const particleCount = 150000;
    particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const initialX = new Float32Array(particleCount); // Store initial X positions
  
    const color = new THREE.Color();
    
    // Calculate viewport dimensions at camera position
    const vFOV = THREE.MathUtils.degToRad(75);
    const height = 2 * Math.tan(vFOV / 2) * Math.abs(camera.position.y);
    const width = height * aspectRatio;
    
    // Create a grid distribution
    const columns = Math.sqrt(particleCount);
    const rows = columns;
    
    for (let i = 0; i < particleCount; i++) {
      const col = (i % columns);
      const row = Math.floor(i / columns);
      
      // Position particles in a grid with some randomness
      const x = (col / columns) * width - width/2 + (Math.random() - 0.5) * 2;
      const z = (row / rows) * height - height/2 + (Math.random() - 0.5) * 2;
      const y = 0;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      initialX[i] = x; // Store initial X position
      
      // Color gradient
      const shade = Math.random() * 0.15 + 0.05;
      color.setRGB(shade, shade, shade * 1.2);
      // Gold color components (r: 1, g: 0.84, b: 0)
      color.setRGB(
        1.0 * shade, // Red component
        0.84 * shade, // Green component slightly lower
        0.0 * shade  // Blue component very low for gold effect
      );
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      sizes[i] = Math.random() * 0.3 + 0.1;
    }
  
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
    const material = new THREE.PointsMaterial({
      size: 0.1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    });
  
    pointCloud = new THREE.Points(particles, material);
    scene.add(pointCloud);
  
    // Store initial X positions as a property of pointCloud
    pointCloud.userData.initialX = initialX;
    pointCloud.userData.width = width;
  
    // Disable controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false;
  
    // Resize Handling
    window.addEventListener('resize', handleResize);
  }
  
  function handleResize() {
    if (camera && renderer) {
      const aspectRatio = window.innerWidth / window.innerHeight;
      camera.aspect = aspectRatio;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      
      // Update particle positions for new screen size
      if (pointCloud) {
        const vFOV = THREE.MathUtils.degToRad(75);
        const height = 2 * Math.tan(vFOV / 2) * Math.abs(camera.position.y);
        const width = height * aspectRatio;
        pointCloud.userData.width = width;
      }
    }
  }
  
  let time = 0;
  let lastWaveTime = 0;
  const WAVE_INTERVAL = 8000;
  const MOVEMENT_SPEED = 0.8;
  const WAVE_RADIUS_MULTIPLIER = 35;
  const WAVE_INFLUENCE_DISTANCE = 25;
  const FADE_MULTIPLIER = 3;
  const WAVE_SPEED = 0.2;
  const MIN_WAVES = 1;
  const MAX_WAVES = 4;
  
  // Wave direction patterns
  const WAVE_PATTERNS = [
    { // Right to left
      startX: (width) => width/2 + WAVE_RADIUS_MULTIPLIER,
      startZ: () => 0,
      moveX: (progress, width) => -progress * width * WAVE_SPEED,
      moveZ: () => 0
    },
    { // Left to right
      startX: (width) => -width/2 - WAVE_RADIUS_MULTIPLIER,
      startZ: () => 0,
      moveX: (progress, width) => progress * width * WAVE_SPEED,
      moveZ: () => 0
    },
    { // Top right to bottom left
      startX: (width) => width/2 + WAVE_RADIUS_MULTIPLIER,
      startZ: (height) => -height/2,
      moveX: (progress, width) => -progress * width * WAVE_SPEED,
      moveZ: (progress, height) => progress * height * WAVE_SPEED * 0.5
    },
    { // Top left to bottom right
      startX: (width) => -width/2 - WAVE_RADIUS_MULTIPLIER,
      startZ: (height) => -height/2,
      moveX: (progress, width) => progress * width * WAVE_SPEED,
      moveZ: (progress, height) => progress * height * WAVE_SPEED * 0.5
    },
    { // Bottom right to top left
      startX: (width) => width/2 + WAVE_RADIUS_MULTIPLIER,
      startZ: (height) => height/2,
      moveX: (progress, width) => -progress * width * WAVE_SPEED,
      moveZ: (progress, height) => -progress * height * WAVE_SPEED * 0.5
    },
    { // Bottom left to top right
      startX: (width) => -width/2 - WAVE_RADIUS_MULTIPLIER,
      startZ: (height) => height/2,
      moveX: (progress, width) => progress * width * WAVE_SPEED,
      moveZ: (progress, height) => -progress * height * WAVE_SPEED * 0.5
    }
  ];
  
  // Track multiple waves with random patterns
  let waves = [];
  
  // Function to create a new wave with random pattern
  function createNewWave(width, height) {
    const pattern = WAVE_PATTERNS[Math.floor(Math.random() * WAVE_PATTERNS.length)];
    return {
      startTime: Date.now(),
      progress: 0,
      active: true,
      pattern,
      startX: pattern.startX(width),
      startZ: pattern.startZ(height || width)
    };
  }
  
  function animate() {
    time += 0.0002;
    
    if (pointCloud) {
      const positions = particles.attributes.position.array;
      const colors = particles.attributes.color.array;
      const sizes = particles.attributes.size.array;
      const width = pointCloud.userData.width;
      const height = width; // Using width as height for now
      const currentTime = Date.now();
      
      // Initialize waves if none exist
      if (waves.length === 0) {
        const numWaves = Math.floor(Math.random() * (MAX_WAVES - MIN_WAVES + 1)) + MIN_WAVES;
        for (let i = 0; i < numWaves; i++) {
          waves.push(createNewWave(width, height));
        }
      }
      
      // Update and manage waves
      waves = waves.filter(wave => wave.active);
      
      // Create new waves when needed
      if (waves.length < MIN_WAVES) {
        const newWavesNeeded = Math.floor(Math.random() * (MAX_WAVES - waves.length)) + 1;
        for (let i = 0; i < newWavesNeeded; i++) {
          waves.push(createNewWave(width, height));
        }
      }
      
      // Update wave progress
      waves.forEach(wave => {
        if (wave.active) {
          wave.progress = Math.min((currentTime - wave.startTime) / 1000, 8);
          
          // Deactivate waves that have completed
          if (wave.progress >= 8) {
            wave.active = false;
          }
        }
      });
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] -= MOVEMENT_SPEED * 0.005;
        
        if (positions[i] < -width/2) {
          positions[i] = width/2;
        }
        
        const x = positions[i];
        const z = positions[i + 2];
        
        let maxParticleOpacity = 0;
        let maxHeight = 0;
        let maxSize = 0;
        
        // Process each active wave
        waves.forEach(wave => {
          if (!wave.active) return;
          
          // Calculate wave position based on pattern
          const waveCenterX = wave.startX + wave.pattern.moveX(wave.progress, width);
          const waveCenterZ = wave.startZ + wave.pattern.moveZ(wave.progress, height);
          
          const distanceFromWaveCenter = Math.sqrt(
            Math.pow(x - waveCenterX, 2) + 
            Math.pow(z - waveCenterZ, 2)
          );
          
          if (wave.progress > 0) {
            const waveRadius = WAVE_RADIUS_MULTIPLIER;
            const distanceFromWave = Math.abs(distanceFromWaveCenter - waveRadius);
            
            const waveInfluence = Math.max(0, 1 - (distanceFromWave / WAVE_INFLUENCE_DISTANCE));
            const smoothInfluence = Math.pow(waveInfluence, 2) * (3 - 2 * waveInfluence);
            
            // Modify condition to check wave direction
            const isMovingRight = wave.pattern.moveX(1, width) > 0;
            if ((isMovingRight ? x > waveCenterX : x < waveCenterX) && smoothInfluence > 0.05) {
              const horizontalDistance = Math.abs(waveCenterX - x);
              const fadeDistance = WAVE_INFLUENCE_DISTANCE * FADE_MULTIPLIER;
              const horizontalFade = Math.pow(Math.min(horizontalDistance / fadeDistance, 1), 1.5);
              
              const frontDistance = Math.max(0, waveRadius - distanceFromWaveCenter);
              const frontFade = Math.pow(Math.max(0, 1 - frontDistance / (WAVE_INFLUENCE_DISTANCE * 0.5)), 2);
              
              const rightEdgeDistance = width/2 - x;
              const edgeFade = Math.min(rightEdgeDistance / (WAVE_INFLUENCE_DISTANCE), 1);
              
              const particleOpacity = smoothInfluence * 0.6 * horizontalFade * frontFade * edgeFade;
              const height = smoothInfluence * Math.sin(time * 1.5) * 1.2 * horizontalFade;
              const size = (Math.random() * 0.15 + 0.05) * smoothInfluence * horizontalFade;
              
              maxParticleOpacity = Math.max(maxParticleOpacity, particleOpacity);
              maxHeight = Math.max(maxHeight, height);
              maxSize = Math.max(maxSize, size);
            }
          }
        });
        
        // Apply the maximum values from all waves
        if (maxParticleOpacity > 0) {
          const brightness = Math.random() * 0.2 + 0.8;
          positions[i + 1] = maxHeight;
          colors[i] = brightness * maxParticleOpacity;
          colors[i + 1] = brightness * maxParticleOpacity;
          colors[i + 2] = brightness * maxParticleOpacity * 1.2;
          // Gold color with brightness and opacity
          colors[i] = brightness * maxParticleOpacity; // Red
          colors[i + 1] = brightness * 0.84 * maxParticleOpacity; // Green at 84%
          colors[i + 2] = 0; // Blue at 0 for gold effect
          sizes[i/3] = maxSize;
        } else {
          colors[i] = 0;
          colors[i + 1] = 0;
          colors[i + 2] = 0;
          sizes[i/3] = 0;
          positions[i + 1] = 0;
        }
      }
      
      particles.attributes.position.needsUpdate = true;
      particles.attributes.color.needsUpdate = true;
      particles.attributes.size.needsUpdate = true;
    }
    
    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(animate);
  }
  </script>
  
  <style scoped>
  .wave-particles-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    background: transparent;
    pointer-events: none;
  }
  </style>