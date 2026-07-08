import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home/home.tsx"),
  route("feed.xml", "routes/feed.ts"),
  route("sitemap.xml", "routes/sitemap.ts"),
  route("robots.txt", "routes/robots.ts"),
  route(".well-known/site.standard.publication", "routes/well-known-publication.ts"),
  route("tag/:tag", "routes/tag/tag.tsx"),
  route(":groupSlug/:articleSlug", "routes/post/post.tsx"),
  route(":groupSlug", "routes/group/group.tsx"),
] satisfies RouteConfig;
