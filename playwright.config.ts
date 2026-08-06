import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1, // Mantenemos 1 worker para evitar colisiones de datos si los usuarios compartan sesión
  forbidOnly: !!process.env.CI,  
  retries: process.env.CI ? 1 : 0, // Reducimos a 1 reintento para acortar el tiempo total si algo falla
  
  // Timeout GLOBAL para cada test individual (Aumentado a 3 minutos en CI)
  timeout: process.env.CI ? 180000 : 60000,

  expect: {
    // Timeout para las aserciones expect(...).toBeVisible(), toHaveCount(), etc.
    timeout: process.env.CI ? 15000 : 5000, 
  },

  reporter: 'html',
  
  use: {
    baseURL: 'https://portal-test.galeno.com.ar',
    trace: 'on-first-retry',  
    actionTimeout: 60000,
    navigationTimeout: 90000, // Le damos más margen a la navegación en los servidores de CI
  },
  
  projects: [
    {
      name: 'setup',
      testMatch: /.*login\.setup\.spec\.ts/,
      workers: 1
    },
    {
      name: 'chromium-oro',
      use: { browserName: 'chromium' }
    },
    {
      name: 'chromium-plata',
      use: { browserName: 'chromium' }
    },
    {
      name: 'chromium-azul',
      use: { browserName: 'chromium' }
    }
  ],
});