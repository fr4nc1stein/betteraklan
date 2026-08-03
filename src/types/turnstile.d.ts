interface TurnstileRenderOptions {
  sitekey: string;
  action?: string;
  appearance?: 'always' | 'execute' | 'interaction-only';
  execution?: 'render' | 'execute';
  size?: 'normal' | 'compact' | 'flexible';
  retry?: 'auto' | 'never';
  callback?: (token: string) => void;
  'error-callback'?: (error: unknown) => void;
  'expired-callback'?: () => void;
}

interface TurnstileApi {
  render(container: HTMLElement | string, options: TurnstileRenderOptions): string;
  execute(widgetId: string): void;
  reset(widgetId?: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export {};
