//@ts-nocheck
import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import type { SnakeCase } from "string-ts";

const useGoogleAnalytics = (gaMeasurementId: string | undefined) => {
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    const loadScript = () => {
      // gaMeasurementId is optional so not all devs need it to run the app
      if (!window.gtag && gaMeasurementId) {
        // Create the script element
        const script = document.createElement("script");
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
        script.async = true;
        // Append the script to the document
        document.head.appendChild(script);
        // Initialize gtag when the script is loaded - this could be done before
        script.onload = () => {
          window.dataLayer = window.dataLayer || [];
          function gtag() {
            window.dataLayer.push(arguments);
          }
          window.gtag = gtag;
          window.gtag("js", new Date());
          window.gtag("config", gaMeasurementId, {
            debug_mode: false, // I keep this here to remember where to toggle debug
          });
          // Mark as initialized
          setIsInitialized(true);
        };
      } else {
        // gtag is already available, mark as initialized
        setIsInitialized(true);
      }
    };
    loadScript();
  }, [gaMeasurementId]);
  return isInitialized;
};

const GoogleAnalyticsHead = () => {
  const location = useLocation();
  const gaMeasurementId = "G-Z6N3C35PLR";

  const isGaInitialized = useGoogleAnalytics(gaMeasurementId);

  useEffect(() => {
    if (isGaInitialized && gaMeasurementId) {
      //@ts-ignore
      window.gtag("config", gaMeasurementId, {
        page_path: location.pathname,
      });
    }
  }, [isGaInitialized, location, gaMeasurementId]);
  return null;
};

const trackClientAnalyticsEvent = <T extends string>(
  eventName: T & SnakeCase<T>, // GA only supports snake_case event names. Let's enforce it at type-level to make life easier
  properties?: Record<string, unknown>
) => {
  console.log("eventName", eventName);
  console.log("properties", properties);
  return window.gtag && window.gtag("event", eventName, properties);
};

export { GoogleAnalyticsHead, trackClientAnalyticsEvent };

export default useGoogleAnalytics;
