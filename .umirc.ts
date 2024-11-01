import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "index" },
    { path: "/edit", component: "edit" },
    { path: "/single", component: "single" },
    { path: "/mocap", component: "mocap" },
    { path: "/docs", component: "docs" },
  ],
  npmClient: 'yarn',
  esbuildMinifyIIFE: true
});
