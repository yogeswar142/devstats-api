import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env.js';
import { healthRoutes } from './routes/health.route.js';
import { v1Routes } from './routes/v1/index.js';

export function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV === 'test' ? false : { level: 'info' },
  });

  // Register CORS
  app.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
  });

  // Register Health Routes
  app.register(healthRoutes);

  // Register V1 API Routes
  app.register(v1Routes, { prefix: '/api/v1' });

  return app;
}
