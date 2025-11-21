import { defineConfig } from 'vite';
import { join } from 'path';
import react from '@vitejs/plugin-react';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import commonjs from 'vite-plugin-commonjs';
import { viteStaticCopy as staticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
		react(),
		wasm(),
		topLevelAwait(),
		commonjs(),
		staticCopy({
      targets: [
        {
          src: '/app/app/component/metabolic/Analysis/FluxBalanceAnalysis/fba.wasm',
          dest: 'assets'
        }
      ]
    })
	],
	assetsInclude: ['**/*.wasm'],
	server: {
		host: "0.0.0.0", 
	},
	resolve: {
		alias: [
			{
				find: /~(.+)/,
				replacement: join(process.cwd(), 'node_modules/$1'),
			}
		]
	},
	css: {
    modules: {
        localsConvention: 'camelCase',
    },
	},
	build: {
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
			}
		}
	}
});