// Delays presentation only; cleanup prevents a completed request showing a loader.
export function scheduleLoadingReveal(reveal, delay = 250) {
  const timer = setTimeout(reveal, delay);
  return () => clearTimeout(timer);
}
