#!/usr/bin/env node
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http-server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROUTES = [
  { path: '/', outputPath: 'dist/index.html' },
  { path: '/products', outputPath: 'dist/products/index.html' },
  { path: '/contact', outputPath: 'dist/contact/index.html' },
  { path: '/cart', outputPath: 'dist/cart/index.html' },
];

const PORT = 8888;

async function prerender() {
  console.log('🔄 Starting prerender...');
  
  try {
    // Start a simple http-server
    const httpServer = createServer({ root: 'dist' });
    
    await new Promise((resolve) => {
      httpServer.listen(PORT, () => {
        console.log(`📦 Server running at http://localhost:${PORT}`);
        resolve();
      });
    });

    let browser;
    try {
      browser = await puppeteer.launch({
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ],
        timeout: 30000,
      });

      for (const route of ROUTES) {
        try {
          console.log(`📄 Prerendering: ${route.path}`);
          
          const page = await browser.newPage();
          
          // Capture console messages
          page.on('console', msg => console.log(`   [Browser] ${msg.type()}: ${msg.text()}`));
          page.on('error', err => console.error(`   [Browser Error] ${err}`));
          
          await page.goto(`http://localhost:${PORT}${route.path}`, {
            waitUntil: 'networkidle0',
            timeout: 30000,
          });
          
          // Wait for React to render - wait for header to appear
          try {
            await page.waitForSelector('header', { timeout: 10000 });
            console.log(`   ⏳ React rendered, waiting for content...`);
            // Extra wait for content to settle
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (e) {
            console.log(`   ⚠️  Header not found after 10s, waiting longer...`);
            // Try alternative selectors
            try {
              await page.waitForSelector('[id="root"]', { timeout: 5000 });
              console.log(`   ✓ Root element found, waiting more...`);
              await new Promise(resolve => setTimeout(resolve, 3000));
            } catch {
              console.log(`   ⚠️  Root element not rendered, capturing shell...`);
            }
          }
          
          const html = await page.content();
          
          // Ensure directory exists
          const dir = path.dirname(route.outputPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          fs.writeFileSync(route.outputPath, html);
          console.log(`✅ Saved: ${route.outputPath} (${Math.round(html.length / 1024)}KB)`);
          
          await page.close();
        } catch (error) {
          console.error(`❌ Error prerendering ${route.path}:`, error.message);
        }
      }

      await browser.close();
      console.log('✨ Prerender complete!');
    } catch (error) {
      console.error('❌ Prerender failed:', error);
    } finally {
      httpServer.close();
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

prerender();
