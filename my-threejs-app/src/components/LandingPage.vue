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
            <li><a href="#" class="active">Home</a></li>
            <li><a href="#">About me</a></li> 
            <li><a href="#">Projects</a></li>
            <li><a href="#">Skills & Tech Stack</a></li>
            <li><a href="#">Experience / Work</a></li>
            <li><a href="#">Contacts</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#" class="resume-link">Resume (download)</a></li>
          </ul>
        </nav>
        <div class="personal-info">
            <p>
                Born in 2000 <br>
                in Manila, <br>
                Philippines <br>
                From fear to finesse— <br>
                every developer <br>
                starts somewhere.
            </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import WaveParticles from './Three.js/WaveParticles.vue';
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
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.particles-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 2rem;
}

.side-nav {
  width: 35%;
  padding: 2rem;
  backdrop-filter: blur(0px);
  border-radius: 24px;
  z-index: 2;
  display: flex;
  flex-direction: column;
}

.nav-header {
  margin-bottom: 3rem;
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
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.nav-links a {
  color: #ffffff;
  text-decoration: none;
  font-size: 1rem;
  transition: opacity 0.3s ease;
  opacity: 0.7;
  font-weight: 500;
}

.nav-links a:hover,
.nav-links a.active {
  opacity: 1;
}

.resume-link {
  opacity: 0.6;
  font-size: 0.9rem;
  font-weight: 400;
}

.personal-info {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  text-align: right;
  backdrop-filter: blur(0px);
  padding: 2rem;
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

</style>