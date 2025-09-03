import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		//FIXME: del for prod
		host: '0.0.0.0',
		port: 5173,
		proxy: {
			'/course_api': {
				target: 'http://course_api_dev:8080',
				changeOrigin: true,
				ws: true,
				rewrite: p => p.replace(/^\/course_api/, ''),
			},
		},
	},
});
