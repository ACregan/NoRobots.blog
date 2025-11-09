import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home/home.tsx"),
  route("post/:articleId", "routes/post/post.tsx"),
] satisfies RouteConfig;
