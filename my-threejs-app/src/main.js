import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import LandingPage from './components/LandingPage.vue'
import AboutMe from './components/AboutMe.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: LandingPage
    },
    {
      path: '/about',
      name: 'About',
      component: AboutMe
    }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
