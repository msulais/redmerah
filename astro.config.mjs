import { defineConfig } from 'astro/config';
import solid from '@astrojs/solid-js';
import vercel from "@astrojs/vercel/static";

// https://astro.build/config
export default defineConfig({
	scopedStyleStrategy: 'class',
	integrations: [solid()],
	vite: { css: { modules: { generateScopedName: '[hash:base64:8]' }}},
	output: 'static',
	adapter: vercel(),
	server: { port: 3100 }
})