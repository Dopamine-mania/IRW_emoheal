import posthog from 'posthog-js';

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST;
const isDev = import.meta.env.DEV;

if (!posthogKey || !posthogHost) {
  console.warn('PostHog environment variables are missing. Analytics will be disabled.');
}

/**
 * Track a custom event
 * @param eventName - Name of the event to track
 * @param properties - Optional properties to attach to the event
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // Log events in development mode instead of sending to PostHog
  if (isDev) {
    console.log(`[Analytics DEV] Event: ${eventName}`, properties);
    return;
  }

  if (!posthogKey) return;

  try {
    posthog.capture(eventName, properties);
  } catch (error) {
    console.error('[Analytics] Capture error:', error);
  }
};

/**
 * Identify a user - critical for linking anonymous sessions to email
 * @param email - User's email address
 * @param properties - Additional user properties
 */
export const identifyUser = (email: string, properties?: Record<string, any>) => {
  // Log user identification in development mode
  if (isDev) {
    console.log(`[Analytics DEV] Identify: ${email}`, properties);
    return;
  }

  if (!posthogKey) return;

  try {
    posthog.identify(email, {
      email,
      ...properties
    });
  } catch (error) {
    console.error('[Analytics] Identify error:', error);
  }
};

/**
 * Reset user identity (e.g., on logout)
 */
export const resetUser = () => {
  if (isDev) {
    console.log('[Analytics DEV] Reset user');
    return;
  }

  if (!posthogKey) return;

  try {
    posthog.reset();
  } catch (error) {
    console.error('[Analytics] Reset error:', error);
  }
};
