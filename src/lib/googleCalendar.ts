// Client-side Google Calendar integration via Google Identity Services (GIS) OAuth token flow.
// No backend required. Requires NEXT_PUBLIC_GOOGLE_CLIENT_ID to be set.

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  error?: string;
}

type TokenClient = {
  requestAccessToken: (options?: { prompt?: string }) => void;
  callback: (resp: TokenResponse) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: TokenResponse) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

const TOKEN_KEY = 'momentum-google-token';

interface StoredToken {
  access_token: string;
  expires_at: number; // unix ms
}

export function getStoredToken(): StoredToken | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const token = JSON.parse(raw) as StoredToken;
    if (token.expires_at <= Date.now()) return null;
    return token;
  } catch {
    return null;
  }
}

export function storeToken(token: StoredToken) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isGoogleConfigured(): boolean {
  return !!CLIENT_ID;
}

export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'));
    if (window.google?.accounts?.oauth2) return resolve();
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google script'));
    document.body.appendChild(script);
  });
}

export async function signInToGoogle(): Promise<StoredToken> {
  if (!CLIENT_ID) throw new Error('Google Client ID not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID.');
  await loadGoogleScript();
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services not loaded'));
      return;
    }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (resp) => {
        if (resp.error) {
          reject(new Error(resp.error));
          return;
        }
        const token: StoredToken = {
          access_token: resp.access_token,
          expires_at: Date.now() + (resp.expires_in - 60) * 1000,
        };
        storeToken(token);
        resolve(token);
      },
    });
    client.requestAccessToken({ prompt: 'consent' });
  });
}

export interface GoogleEvent {
  id: string;
  summary?: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

export async function fetchGoogleEvents(rangeStart: Date, rangeEnd: Date): Promise<GoogleEvent[]> {
  const token = getStoredToken();
  if (!token) throw new Error('Not signed in to Google');

  const params = new URLSearchParams({
    timeMin: rangeStart.toISOString(),
    timeMax: rangeEnd.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token.access_token}` } }
  );

  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      throw new Error('Session expired. Please reconnect.');
    }
    throw new Error(`Google Calendar error: ${res.status}`);
  }

  const data = await res.json();
  return (data.items || []) as GoogleEvent[];
}

export async function pushEventToGoogle(event: {
  title: string;
  start: string;
  end: string;
  description?: string;
}): Promise<string> {
  const token = getStoredToken();
  if (!token) throw new Error('Not signed in to Google');

  const body = {
    summary: event.title,
    description: event.description,
    start: { dateTime: new Date(event.start).toISOString() },
    end: { dateTime: new Date(event.end).toISOString() },
  };

  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) throw new Error(`Failed to push event: ${res.status}`);
  const data = await res.json();
  return data.id as string;
}
