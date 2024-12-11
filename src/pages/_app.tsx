import '../app/globals.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { PostHogProvider } from 'posthog-js/react';
import posthog from 'posthog-js';
import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/next';

// Google Tag Manager Component (fallback for the assumed package)
const GoogleTagManager = ({ gtmId }: { gtmId: string }) => {
  useEffect(() => {
    if (gtmId && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
      script.async = true;
      document.head.appendChild(script);
    }
  }, [gtmId]);
  return null;
};

const TRACKING_ID = 'G-60ZNPPYEPB'; // Your Google Analytics ID
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    if (POSTHOG_KEY && POSTHOG_HOST) {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        autocapture: true,
      });

      const handleRouteChange = (url: string) => {
        posthog.capture('pageview', { path: url });
      };

      router.events.on('routeChangeComplete', handleRouteChange);

      return () => {
        router.events.off('routeChangeComplete', handleRouteChange);
        posthog.reset();
      };
    } else {
      console.warn('PostHog configuration is missing.');
    }
  }, [router.events]);

  return (
    <>
      {/* Google Tag Manager */}
      <GoogleTagManager gtmId={TRACKING_ID} />
      <PostHogProvider client={posthog}>
        <Component {...pageProps} />
        <Analytics />
      </PostHogProvider>
    </>
  );
}

export default app;
