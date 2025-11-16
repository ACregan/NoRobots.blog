# NoRobots.blog

ATProto driven blogging site started as a POC but I quite like it so I might stick with it, use it as a place to host creative writing and mundane personal musings.

---

## NOTES:

This will likely come in handy:
https://mutualaid.info/posts/a-rough-sketch-of-at-protocol-and-pds-self-hosting/

and this
curl -s 'https://bsky.social/xrpc/com.atproto.repo.listRecords?repo=anthonycregan.dev&collection=com.whtwnd.blog.entry'

---

16/11/2025

After a bit of wrangling we used this to add Google Analytics
https://dev.to/seasonedcc/google-analytics-ga4-implementation-with-react-remix-example-59j

NOTE: In order to get it to start receiving events I needed to turn off both 'Privacy Badger' widget in browser and disable 'PiHole' for half an hour. Obviously other users should not have this problem but its worth noting in case we implement this elsewhere. If we have trouble sending or logging events in the GA console, this will be why.

---

<!--
# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.

 -->
