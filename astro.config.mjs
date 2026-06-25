// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
	scopedStyleStrategy: 'class',
	vite: {
		css: { modules: { generateScopedName: '[hash:base64:8]' }},
		resolve: {
			alias: {
				'@': 'src',
			},
		},
	},
	output: 'static',
	adapter: vercel(),
	server: { port: 3100 }
})