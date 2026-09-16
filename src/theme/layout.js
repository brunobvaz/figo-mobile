// Shared widths keep forms readable and product feeds useful on tablets.
export const CONTENT_MAX_WIDTH = 1200;
export const FORM_MAX_WIDTH = 640;
export const CARD_RADIUS = 18;
export const PAGE_PADDING = 16;

export function productGridLayout(width, fontScale = 1) {
  const gap = 16;
  const minimum = (width >= 600 ? 210 : 164) * Math.max(1, fontScale);
  const columns = Math.max(1, Math.min(4, Math.floor((width + gap) / (minimum + gap))));
  return { columns, cardWidth: Math.max(0, (width - gap * (columns - 1)) / columns) };
}
