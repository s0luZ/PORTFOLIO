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
  scene.background = new THREE.Color(0x1e2432);
  
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
const MOVEMENT_SPEED = 1;
const WAVE_RADIUS_MULTIPLIER = 35;
const WAVE_INFLUENCE_DISTANCE = 25;
const FADE_MULTIPLIER = 3;
const WAVE_SPEED = 0.25;
const SECOND_WAVE_TRIGGER = 0.6; // When first wave is at 60% of screen width

// Track multiple waves
let waves = [{
  startTime: 0,
  progress: 0,
  active: false
}, {
  startTime: 0,
  progress: 0,
  active: false
}];

function animate() {
  time += 0.0002;
  
  if (pointCloud) {
    const positions = particles.attributes.position.array;
    const colors = particles.attributes.color.array;
    const sizes = particles.attributes.size.array;
    const width = pointCloud.userData.width;
    const currentTime = Date.now();
    
    // Update first wave
    if (currentTime - lastWaveTime > WAVE_INTERVAL) {
      lastWaveTime = currentTime;
      waves[0].startTime = currentTime;
      waves[0].active = true;
      waves[0].progress = 0;
    }
    
    // Update wave progress
    waves.forEach((wave, index) => {
      if (wave.active) {
        wave.progress = Math.min((currentTime - wave.startTime) / 1000, 8);
        
        // Start second wave when first wave reaches trigger point
        if (index === 0 && !waves[1].active && wave.progress * WAVE_SPEED > SECOND_WAVE_TRIGGER) {
          waves[1].startTime = currentTime;
          waves[1].active = true;
          waves[1].progress = 0;
        }
        
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
        
        const waveCenterX = (width/2 + WAVE_RADIUS_MULTIPLIER) - (wave.progress * width * WAVE_SPEED);
        const waveCenterZ = 0;
        
        const distanceFromWaveCenter = Math.sqrt(
          Math.pow(x - waveCenterX, 2) + 
          Math.pow(z - waveCenterZ, 2)
        );
        
        if (wave.progress > 0 && x <= width/2) {
          const waveRadius = WAVE_RADIUS_MULTIPLIER;
          const distanceFromWave = Math.abs(distanceFromWaveCenter - waveRadius);
          
          const waveInfluence = Math.max(0, 1 - (distanceFromWave / WAVE_INFLUENCE_DISTANCE));
          const smoothInfluence = Math.pow(waveInfluence, 2) * (3 - 2 * waveInfluence);
          
          if (x < waveCenterX && smoothInfluence > 0.05) {
            const horizontalDistance = waveCenterX - x;
            const fadeDistance = WAVE_INFLUENCE_DISTANCE * FADE_MULTIPLIER;
            const horizontalFade = Math.pow(Math.min(horizontalDistance / fadeDistance, 1), 1.5);
            
            const frontDistance = Math.max(0, waveRadius - distanceFromWaveCenter);
            const frontFade = Math.pow(Math.max(0, 1 - frontDistance / (WAVE_INFLUENCE_DISTANCE * 0.5)), 2);
            
            const rightEdgeDistance = width/2 - x;
            const edgeFade = Math.min(rightEdgeDistance / (WAVE_INFLUENCE_DISTANCE), 1);
            
            const particleOpacity = smoothInfluence * 0.6 * horizontalFade * frontFade * edgeFade;
            const height = smoothInfluence * Math.sin(time * 1.5) * 1.2 * horizontalFade;
            const size = (Math.random() * 0.15 + 0.05) * smoothInfluence * horizontalFade;
            
            // Keep maximum values
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
