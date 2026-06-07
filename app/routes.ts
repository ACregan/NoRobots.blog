import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home/home.tsx"),
  route("article/:articleId", "routes/post/post.tsx"),
  route(":groupSlug", "routes/group/group.tsx"),
] satisfies RouteConfig;
