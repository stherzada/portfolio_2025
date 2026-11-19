import posthog from 'posthog-js'

type LogAttributes = Record<string, string | number | boolean>

const posthogConfigured = Boolean(
  import.meta.env.VITE_POSTHOG_PROJECT_TOKEN && import.meta.env.VITE_POSTHOG_HOST,
)

export const posthogAppLogger = {
  info(message: string, attributes?: LogAttributes) {
    if (posthogConfigured) posthog.logger.info(message, attributes)
  },
  warn(message: string, attributes?: LogAttributes) {
    if (posthogConfigured) posthog.logger.warn(message, attributes)
  },
}
