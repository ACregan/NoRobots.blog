import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import type { SnakeCase } from "string-ts";
import { GA_MEASUREMENT_ID } from "~/config";

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

const useGoogleAnalytics = (gaMeasurementId: string | undefined) => {
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    if (!gaMeasurementId) {
      setIsInitialized(true);
      return;
    }
    // Avoid double-loading if script is already in the document
    if (document.querySelector(`script[src*="googletagmanager.com"]`)) {
      setIsInitialized(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
    script.async = true;
    document.head.appendChild(script);
    script.onload = () => {
      window.dataLayer = window.dataLayer ?? [];
      // Standard GA initialization — the SDK reads the arguments object from dataLayer
      window.gtag = function gtag() {
        window.dataLayer.push(arguments as unknown);
      } as unknown as Gtag.Gtag;
      window.gtag("js", new Date());
      window.gtag("config", gaMeasurementId, { debug_mode: false });
      setIsInitialized(true);
    };
  }, [gaMeasurementId]);
  return isInitialized;
};

export const GoogleAnalyticsHead = () => {
  const location = useLocation();
  const isGaInitialized = useGoogleAnalytics(GA_MEASUREMENT_ID);
  useEffect(() => {
    if (isGaInitialized) {
      window.gtag?.("config", GA_MEASUREMENT_ID, {
        page_path: location.pathname,
      });
    }
  }, [isGaInitialized, location]);
  return null;
};

export const AnalyticsEvent = {
  headerHomepageLinkClick: "header_homepage_link_click",
  footerAtprotoExternalLinkClick: "footer_atproto_external_link_click",
  footerBlueskyExternalLinkClick: "footer_bluesky_external_link_click",
  postLinkClick: "post_link_click",
} as const;

export const trackClientAnalyticsEvent = <T extends string>(
  eventName: T & SnakeCase<T>,
  properties?: Record<string, unknown>,
) => {
  window.gtag?.("event", eventName, properties);
};

export default useGoogleAnalytics;
