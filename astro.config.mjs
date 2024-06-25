import { defineConfig } from 'astro/config';
import solid from '@astrojs/solid-js';

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  scopedStyleStrategy: 'class',
  integrations: [solid()],
  vite: {
    css: {
      modules: {
        generateScopedName: '[hash:base64:8]'
      }
    }
  },
  output: "server",
  adapter: vercel()
});