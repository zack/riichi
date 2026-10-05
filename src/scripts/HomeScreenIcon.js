const ICON_COLORS = [
  { hex: '#272a2d', id: 'dark' },
  { hex: '#28684a', id: 'deep-mat-green' },
  { hex: '#218358', id: 'mat-green' },
  { hex: '#008573', id: 'teal' },
  { hex: '#0d74ce', id: 'mat-blue' },
  { hex: '#104d87', id: 'deep-mat-blue' },
  { hex: '#208368', id: 'jade' },
  { hex: '#107d98', id: 'cyan' },
  { hex: '#3a5bc7', id: 'indigo' },
  { hex: '#253974', id: 'deep-indigo' },
  { hex: '#ca244d', id: 'ruby' },
  { hex: '#ce2c31', id: 'red' },
];

const DEFAULT_ICON_COLOR = 'dark';
const STORAGE_KEY = 'mahjong-icon-color';

function iconColorIsKnown(id) {
  return ICON_COLORS.some((color) => color.id === id);
}

function getStoredIconColor() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return iconColorIsKnown(stored) ? stored : DEFAULT_ICON_COLOR;
  } catch {
    return DEFAULT_ICON_COLOR;
  }
}

function storeIconColor(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // localStorage is blocked. The pick still lasts until the page is closed,
    // which is long enough to install with it.
  }
}

function applyIconColor(id) {
  const isDefault = id === DEFAULT_ICON_COLOR;
  const touchIcon = document.querySelector('link[rel="apple-touch-icon"]');
  const manifest = document.querySelector('link[rel="manifest"]');

  touchIcon?.setAttribute(
    'href',
    isDefault ? '/apple-touch-icon.png' : `/icons/${id}/apple-touch-icon.png`,
  );
  manifest?.setAttribute(
    'href',
    isDefault ? '/manifest.json' : `/manifests/${id}.json`,
  );
}

export { ICON_COLORS, applyIconColor, getStoredIconColor, storeIconColor };
