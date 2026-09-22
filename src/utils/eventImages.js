export function eventImageUrl(image, apiBaseUrl) {
  if (typeof image !== 'string' || !image) return null;
  if (/^\/api\/v1\/events\/[a-f\d]{24}\/image(?:\?|$)/i.test(image)) {
    return new URL(image, apiBaseUrl).toString();
  }
  try {
    const url = new URL(image);
    return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : null;
  } catch { return null; }
}
