import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig, loadEnv} from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

function isServiceRoleKey(key: string): boolean {
  if (key.startsWith('sb_secret_')) return true;
  const parts = key.split('.');
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf8'),
      );
      if (payload && payload.role === 'service_role') {
        return true;
      }
    } catch {
      // Not a JWT; ignore
    }
  }
  return false;
}

export default defineConfig(({command, mode}) => {
  if (command === 'build') {
    const env = loadEnv(mode, rootDir, 'VITE_');
    const supabaseUrl = (
      process.env.VITE_SUPABASE_URL ??
      env.VITE_SUPABASE_URL ??
      ''
    ).trim();
    const anonKey = (
      process.env.VITE_SUPABASE_ANON_KEY ??
      env.VITE_SUPABASE_ANON_KEY ??
      ''
    ).trim();
    const publishableKey = (
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
      env.VITE_SUPABASE_PUBLISHABLE_KEY ??
      ''
    ).trim();

    if (anonKey && isServiceRoleKey(anonKey)) {
      throw new Error(
        '[ASATEK build] VITE_SUPABASE_ANON_KEY contains a secret/service_role key. ' +
          'Paste the "sb_publishable_..." key from Supabase -> Project Settings -> API Keys.',
      );
    }

    if (publishableKey && isServiceRoleKey(publishableKey)) {
      throw new Error(
        '[ASATEK build] VITE_SUPABASE_PUBLISHABLE_KEY contains a secret/service_role key. ' +
          'Paste the "sb_publishable_..." key from Supabase -> Project Settings -> API Keys.',
      );
    }

    const resolvedKey = anonKey || publishableKey;

    if (!supabaseUrl || !resolvedKey) {
      const missing = [
        !supabaseUrl ? 'VITE_SUPABASE_URL' : null,
        !resolvedKey
          ? 'VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY)'
          : null,
      ]
        .filter(Boolean)
        .join(', ');
      throw new Error(
        `[ASATEK build] Missing required Supabase environment variable(s): ${missing}.`,
      );
    }

    if (
      !supabaseUrl.startsWith('https://') &&
      !supabaseUrl.startsWith('http://')
    ) {
      throw new Error(
        '[ASATEK build] VITE_SUPABASE_URL must start with https:// or http://.',
      );
    }
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(rootDir, 'dist');
          const srcAssets = path.resolve(rootDir, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, '.'),
      },
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'react',
                test: /[/\\]node_modules[/\\](react|react-dom|scheduler|react-is)[/\\]/,
                priority: 40,
              },
              {
                name: 'router',
                test: /[/\\]node_modules[/\\](react-router|react-router-dom|@remix-run)[/\\]/,
                priority: 30,
              },
              {
                name: 'supabase',
                test: /[/\\]node_modules[/\\]@supabase[/\\]/,
                priority: 20,
              },
              {
                name: 'charts',
                test: /[/\\]node_modules[/\\](recharts|d3-|victory-vendor)[/\\]/,
                priority: 10,
              },
            ],
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
