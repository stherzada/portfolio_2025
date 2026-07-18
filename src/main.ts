import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { useAuth } from './composables/useAuth'
import { reveal } from './directives/reveal'
import { tilt } from './directives/tilt'
import { magnetic } from './directives/magnetic'
import './style.css'

const { initAuth } = useAuth()
await initAuth()

const app = createApp(App)
app.use(router)
app.use(i18n)
app.directive('reveal', reveal)
app.directive('tilt', tilt)
app.directive('magnetic', magnetic)
app.mount('#app')
