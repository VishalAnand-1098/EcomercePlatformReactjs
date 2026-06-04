import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { build } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Public routes to pre-render
const ROUTES = ['/', '/products', '/contact', '/cart', '/login', '/register'];

async function buildSSG() {
  // Step 1: Build the client bundle
  console.log('Building client bundle...');
  await build({ logLevel: 'warn' });

  // Step 2: Build the SSR server bundle (bundle all deps to avoid CJS/ESM issues)
  console.log('Building SSR bundle...');
  await build({
    logLevel: 'warn',
    ssr: {
      noExternal: true,
    },
    build: {
      ssr: path.resolve(__dirname, 'src/entry-server.jsx'),
      outDir: path.resolve(__dirname, 'dist-ssr'),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          entryFileNames: 'entry-server.js',
          format: 'esm',
        },
      },
    },
  });

  // Step 3: Read the built index.html template
  const template = fs.readFileSync(
    path.resolve(__dirname, 'dist/index.html'),
    'utf-8'
  );

  // Step 4: Dynamically import the server render function (use file:// URL for Windows compatibility)
  const serverEntry = pathToFileURL(
    path.resolve(__dirname, 'dist-ssr/entry-server.js')
  ).href;
  const { render } = await import(serverEntry);

  // Step 5: Pre-render each public route
  for (const route of ROUTES) {
    try {
      console.log(`  Rendering ${route}...`);
      const { html, helmet } = render(route);

      // Inject rendered body into template
      let fullHtml = template.replace(
        '<div id="root"></div>',
        `<div id="root">${html}</div>`
      );

      // Inject Helmet head tags (title, meta, link, script) if available
      if (helmet) {
        const headHtml = [
          helmet.title?.toString() || '',
          helmet.meta?.toString() || '',
          helmet.link?.toString() || '',
          helmet.script?.toString() || '',
        ]
          .filter(Boolean)
          .join('\n    ');

        if (headHtml) {
          fullHtml = fullHtml.replace('</head>', `  ${headHtml}\n  </head>`);
        }
      }

      // Determine output file path
      const outputPath =
        route === '/'
          ? path.resolve(__dirname, 'dist/index.html')
          : path.resolve(__dirname, `dist${route}/index.html`);

      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, fullHtml, 'utf-8');
      console.log(`  Saved: dist${route === '/' ? '/index.html' : route + '/index.html'}`);
    } catch (err) {
      console.warn(`  Warning: Could not render ${route}: ${err.message}`);
      console.warn('  Falling back to client-side rendering for this route.');
    }
  }

  // Step 6: Clean up the temporary SSR bundle
  fs.rmSync(path.resolve(__dirname, 'dist-ssr'), { recursive: true, force: true });

  console.log('SSG build complete!');
}

buildSSG().catch((err) => {
  console.error('SSG build failed:', err);
  process.exit(1);
});
