export const trackEvent = (eventName: string, eventData?: Record<string, unknown>): void => {
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track(eventName, eventData);
  }
};