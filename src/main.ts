import { createApp } from 'vue'
import posthog from 'posthog-js'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { reveal } from './directives/reveal'
import { tilt } from './directives/tilt'
import { magnetic } from './directives/magnetic'
import { restoreAuthenticatedAdminIdentity } from './composables/useAuth'
import './style.css'

const posthogProjectToken = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN
const posthogHost = import.meta.env.VITE_POSTHOG_HOST

if (posthogProjectToken && posthogHost) {
  posthog.init(posthogProjectToken, {
    api_host: posthogHost,
    defaults: '2026-08-30',
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    },
    logs: {
      serviceName: 'portfolio-web',
      environment: import.meta.env.MODE,
    },
  })
} else if (import.meta.env.DEV) {
  const missingVariable = posthogProjectToken
    ? 'VITE_POSTHOG_HOST'
    : 'VITE_POSTHOG_PROJECT_TOKEN'
  throw new Error(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
  )
}

if (posthogProjectToken && posthogHost) {
  void restoreAuthenticatedAdminIdentity()
}

const app = createApp(App)
app.use(router)
app.use(i18n)
app.directive('reveal', reveal)
app.directive('tilt', tilt)
app.directive('magnetic', magnetic)

app.config.errorHandler = (error) => {
  if (posthogProjectToken && posthogHost) {
    posthog.captureException(error)
  }
}

app.mount('#app')
