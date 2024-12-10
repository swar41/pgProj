// GA4 Event Tracking
export const trackEventGA4 = (eventName: string, params: object) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag('event', eventName, params);
    } else {
      console.warn("GA4 is not initialized or gtag is not available");
    }
  };
  
  // PostHog Event Tracking
  import posthog from 'posthog-js';
  
  export const initPosthog = () => {
    if (typeof window !== 'undefined') {
      posthog.init('phc_MdnKXIuNgcDgKsopUz1bbJjsosGlkzoUTfjTdmJ3JjP', {
        api_host: 'https://us.i.posthog.com', // Customize this if you're using a self-hosted PostHog instance
      });
    }
  };
  
  export const trackPostHogEvent = (eventName: string, properties: object) => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture(eventName, properties);
    } else {
      console.warn("PostHog is not initialized or posthog is not available");
    }
  };
  
  // A utility function that wraps both GA4 and PostHog tracking for consistency
  export const trackEvent = (eventName: string, params: object) => {
    // GA4 tracking
    trackEventGA4(eventName, params);
  
    // PostHog tracking
    trackPostHogEvent(eventName, params);
  };
  