// Frontend Turnstile helper for surfaces that issue a fresh challenge per
// action (e.g. one chat message at a time) rather than a single form
// submit. Uses `appearance: 'execute'` (an invisible widget you call
// .execute() on repeatedly) instead of the standard managed-widget-per-form
// pattern, since Turnstile tokens are single-use and a chat UI needs a new
// one for every message.
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
export const TURNSTILE_ACTION = 'turnstile-spin-v2';

let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Turnstile script'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export class TurnstileExecutor {
  private widgetId: string | null = null;
  private pending: {
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  } | null = null;

  constructor(
    private container: HTMLElement,
    private siteKey: string
  ) {}

  async init(): Promise<void> {
    await loadTurnstileScript();
    if (!window.turnstile) {
      throw new Error('Turnstile failed to initialize');
    }
    this.widgetId = window.turnstile.render(this.container, {
      sitekey: this.siteKey,
      action: TURNSTILE_ACTION,
      // 'interaction-only' keeps the widget invisible unless Cloudflare
      // genuinely needs a visible challenge; 'execute' as the execution
      // mode means it stays idle on render and only runs when we call
      // .execute() ourselves, once per outgoing message.
      appearance: 'interaction-only',
      execution: 'execute',
      retry: 'auto',
      callback: token => {
        this.pending?.resolve(token);
        this.pending = null;
      },
      'error-callback': error => {
        this.pending?.reject(new Error(`Turnstile error: ${String(error)}`));
        this.pending = null;
      },
      'expired-callback': () => {
        this.pending?.reject(new Error('Turnstile token expired'));
        this.pending = null;
      },
    });
  }

  /** Redeems a fresh, single-use token. Call once per outgoing message. */
  getToken(): Promise<string> {
    const turnstile = window.turnstile;
    const widgetId = this.widgetId;
    if (!turnstile || !widgetId) {
      return Promise.reject(new Error('Turnstile not initialized'));
    }
    return new Promise((resolve, reject) => {
      this.pending = { resolve, reject };
      // A previously redeemed token can't be reused — reset before every
      // execute() so the widget issues a genuinely new one.
      turnstile.reset(widgetId);
      turnstile.execute(widgetId);
    });
  }

  destroy(): void {
    if (window.turnstile && this.widgetId) {
      window.turnstile.remove(this.widgetId);
    }
    this.widgetId = null;
    this.pending = null;
  }
}
