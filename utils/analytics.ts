import posthog from 'posthog-js';

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST;

if (!posthogKey || !posthogHost) {
  console.warn('PostHog environment variables are missing. Analytics will be disabled.');
}

/**
 * Track a custom event
 * @param eventName - Name of the event to track
 * @param properties - Optional properties to attach to the event
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (!posthogKey) return;

  posthog.capture(eventName, properties);
};

/**
 * Identify a user - critical for linking anonymous sessions to email
 * @param email - User's email address
 * @param properties - Additional user properties
 */
export const identifyUser = (email: string, properties?: Record<string, any>) => {
  if (!posthogKey) return;

  posthog.identify(email, {
    email,
    ...properties
  });
};

/**
 * Reset user identity (e.g., on logout)
 */
export const resetUser = () => {
  if (!posthogKey) return;

  posthog.reset();
};
