import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-api';
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const TURNSTILE_SITE_KEY = (import.meta as any).env?.VITE_TURNSTILE_SITE_KEY || '';

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export type TurnstileWidgetRef = {
  reset: () => void;
};

type TurnstileWidgetProps = {
  onTokenChange: (token: string | null) => void;
};

let turnstileScriptPromise: Promise<void> | null = null;

const loadTurnstileScript = () => {
  if (window.turnstile) {
    return Promise.resolve();
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Unable to load Turnstile.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.defer = true;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Turnstile.'));
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
};

const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(({ onTokenChange }, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
        onTokenChange(null);
      }
    }),
    [onTokenChange]
  );

  useEffect(() => {
    let isMounted = true;

    if (!TURNSTILE_SITE_KEY || !containerRef.current) {
      if (!TURNSTILE_SITE_KEY) {
        setErrorMessage('Turnstile site key is missing.');
      }
      return;
    }

    onTokenChange(null);
    setErrorMessage('');

    loadTurnstileScript()
      .then(() => {
        if (!isMounted || !containerRef.current || !window.turnstile) {
          return;
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: 'light',
          size: 'flexible',
          callback: (token: string) => {
            onTokenChange(token);
            setErrorMessage('');
          },
          'expired-callback': () => {
            onTokenChange(null);
            setErrorMessage('Verification expired. Please confirm again.');
          },
          'error-callback': () => {
            onTokenChange(null);
            setErrorMessage('Verification could not load. Refresh and try again.');
          }
        });
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }
        onTokenChange(null);
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load verification.');
      });

    return () => {
      isMounted = false;
      onTokenChange(null);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onTokenChange]);

  return (
    <div style={{ display: 'grid', gap: '8px' }}>
      <div ref={containerRef} />
      {errorMessage && <div style={{ color: '#d93e5b', fontSize: '13px' }}>{errorMessage}</div>}
    </div>
  );
});

TurnstileWidget.displayName = 'TurnstileWidget';

export default TurnstileWidget;
