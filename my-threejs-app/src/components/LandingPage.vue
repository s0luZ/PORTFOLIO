<template>
  <div class="landing-container">
    <main class="main-content">
      <p class="copyright">&#169; 2025 Isaiah Macaraeg</p>
      <div class="particles-wrapper">
        <WaveParticles />
        <nav class="side-nav">
          <div class="nav-header">
            <h1>Isaiah Macaraeg</h1>
            <p class="role">Frontend Developer</p>
          </div>
          
          <ul class="nav-links">
            <li><router-link to="/" class="nav-link active">Home</router-link></li>
            <li><router-link to="/about" class="nav-link">About me</router-link></li> 
            <li><router-link to="/projects" class="nav-link">Projects</router-link></li>
            <li><router-link to="/skills" class="nav-link">Skills & Tech Stack</router-link></li>
            <li><router-link to="/experience" class="nav-link">Experience / Work</router-link></li>
            <li><router-link to="/contacts" class="nav-link">Contacts</router-link></li>
            <li><router-link to="/blog" class="nav-link">Blog</router-link></li>
            <li><a href="#" class="resume-link">Resume (download)</a></li>
          </ul>
        </nav>
        <Transition name="fade" appear>
          <div v-show="showContent" class="personal-info">
            <p>
              Born in 2000 <br>
              in Manila, <br>
              Philippines <br>
              From fear to finesse— <br>
              every developer <br>
              starts somewhere.
            </p>
          </div>
        </Transition>
      </div>
    </main>
  </div>
</template>

<script setup>
import WaveParticles from './Three.js/WaveParticles.vue';
import { ref, onMounted } from 'vue';

const showContent = ref(false);

onMounted(() => {
  showContent.value = true;
});
</script>

<style scoped>
.landing-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  color: white;
  padding: 2rem;
}

.main-content {
  flex: 12;
  position: relative;
  background-color: #1e2432;
  border-radius: 0px;
  overflow: hidden;
  border: 1.5px solid rgba(255, 255, 255, 0.5);
}

.particles-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 1.5rem;
}

.side-nav {
  width: 35%;
  backdrop-filter: blur(0px);
  border-radius: 24px;
  z-index: 2;
  display: flex;
  flex-direction: column;
}

.nav-header {
  margin-bottom: 2rem;
}

.nav-header h1 {
  font-size: 2.5rem;
  margin: 0;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role {
  color: #8b8f98;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  font-weight: 400;
}

.nav-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.nav-link {
  color: #ffffff;
  text-decoration: none;
  font-size: 1rem;
  transition: opacity 0.3s ease;
  opacity: 0.7;
  font-weight: 500;
}

.nav-link:hover,
.nav-link.active {
  opacity: 1;
}

.resume-link {
  opacity: 0.6;
  font-size: 0.9rem;
  font-weight: 400;
  color: #ffffff;
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.personal-info {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  text-align: right;
  backdrop-filter: blur(0px);
  border-radius: 16px;
}

.personal-info p {
  margin: 0.2rem 0;
  font-size: 1rem;
  opacity: 0.7;
  font-weight: 400;
}

.copyright {
  position: absolute;
  bottom: 1rem;
  left: 2rem;
  color: #ffffff;
  font-size: 0.8rem;
  opacity: 0.5;
  z-index: 10;
  pointer-events: none;
}

@media (max-width: 768px) {
  .copyright {
    bottom: 0.5rem;
    left: 1rem;
    font-size: 0.7rem;
  }
}

/* Transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: all 2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>