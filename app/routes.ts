import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home/home.tsx"),
  route("feed.xml", "routes/feed.ts"),
  route("sitemap.xml", "routes/sitemap.ts"),
  route(":groupSlug/:articleSlug", "routes/post/post.tsx"),
  route(":groupSlug", "routes/group/group.tsx"),
] satisfies RouteConfig;
