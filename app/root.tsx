import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import "./assets/fonts/inter/inter.css";
import "./root.css";
import {
  AtProtoLogo,
  BlueSky,
  NoRobotsLogo,
  PerpetualSummerSVG,
} from "./components/SvgImage/SvgImage";
import { GoogleAnalyticsHead } from "./hooks/GoogleAnalytics";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "apple-touch-icon",
    sizes: "180x180",
    href: "/apple-touch-icon.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/favicon-32x32.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/favicon-16x16.png",
  },
  {
    rel: "manifest",
    href: "/site.webmanifest",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalyticsHead />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W3KZZHR8"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <header>
          <div className="content-container">
            <a href="/">
              <NoRobotsLogo />
              <h1>NoRobots.blog</h1>
            </a>
            <ul>
              <li>Tech.</li>
              <li>Creativity.</li>
              <li>Travel.</li>
            </ul>
          </div>
        </header>
        <main>
          <div className="content-container">{children}</div>
        </main>
        <footer>
          <div className="footer-container">
            <div className="footer-col1">
              <h1>NoRobots.blog</h1>
              <p>
                100% Human-produced content. <br />
                No Language Models were used in the production of this weblog.
              </p>
            </div>
            <div className="footer-col2">
              <p>Built using</p>
              <a href="https://atproto.com/">
                <AtProtoLogo />
              </a>
              <p>
                Follow us on{" "}
                <a href="https://bsky.app/profile/norobots.blog">BlueSky</a>
              </p>
              <a
                className="bskyicon"
                href="https://bsky.app/profile/norobots.blog"
              >
                <BlueSky />
              </a>
            </div>
            <div className="footer-col3">
              <PerpetualSummerSVG fill="white" />
            </div>
          </div>
        </footer>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "There was a problem.";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
      <a href="/">
        <p>Return the Homepage</p>
      </a>
    </main>
  );
}
