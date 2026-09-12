// Older backends ignore this query and return the original, allowing independent deployments.
export function imageVariantUri(uri, width = 640) {
  if (typeof uri !== 'string') return uri;
  try {
    const url = new URL(uri);
    if (!['http:', 'https:'].includes(url.protocol) || !/^\/uploads\/(products|avatars)\/[a-zA-Z0-9_-]+\.(jpe?g|png|webp)$/i.test(url.pathname)) return uri;
    const size = [160, 320, 640, 1280].find(value => value >= width) || 1280;
    url.searchParams.set('w', String(size));
    url.searchParams.set('v', '1');
    return url.toString();
  } catch { return uri; }
}
