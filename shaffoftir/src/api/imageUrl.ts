// Image URL resolver - converts relative backend paths to full URLs

const API_URL = import.meta.env.VITE_API_URL || 'https://soldier.mrdev.uz';
const EXTENDED_API_URL = import.meta.env.VITE_API_URL_EXTENDED || 'https://soldier.mrdev.uz';

/**
 * Converts a relative image path from the backend to a full URL.
 * Backend returns paths like "/media/results/..." or "/static/captures/..."
 */
export function resolveImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
}

export function getApiUrl(): string {
  return API_URL;
}

export function getExtendedApiUrl(): string {
  return EXTENDED_API_URL;
}
