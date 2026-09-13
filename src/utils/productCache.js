// Responses started before a state change must not restore the old publication state.
export function mergeProductCache(current, incoming) {
  const merged = new Map(current.map(item => [item.id, item]));
  incoming.forEach(item => {
    const previous = merged.get(item.id);
    const previousTime = Date.parse(previous?.updatedAt);
    const incomingTime = Date.parse(item.updatedAt);
    if (Number.isFinite(previousTime) && (!Number.isFinite(incomingTime) || incomingTime < previousTime)) return;
    merged.set(item.id, item);
  });
  return [...merged.values()];
}
