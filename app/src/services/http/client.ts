// Minimal JSON client for our backend (../api). Reads the base URL from EXPO_PUBLIC_API_URL.
import { useAuthStore } from '@/store/authStore';

export class ApiError extends Error {
  /** `message` is the server's own text when it sends one (e.g. the duplicate-label message), else the code. */
  constructor(
    readonly status: number,
    readonly code: string,
    message?: string,
    readonly details: string[] = [],
  ) {
    super(message || code);
    this.name = 'ApiError';
  }
}

const baseUrl = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const response = await fetch(`${baseUrl}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  if (!response.ok) {
    let code = 'request_failed';
    let message: string | undefined;
    let details: string[] = [];
    try {
      const data = (await response.json()) as { error?: string; message?: string; details?: unknown };
      if (data.error) code = data.error;
      message = data.message;
      if (Array.isArray(data.details)) details = data.details.filter((d): d is string => typeof d === 'string');
    } catch {
      // Body was not JSON; keep the generic code.
    }
    throw new ApiError(response.status, code, message, details);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const query = (params: Record<string, string | undefined>) => {
  const entries = Object.entries(params).filter((e): e is [string, string] => e[1] !== undefined && e[1] !== '');
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : '';
};
