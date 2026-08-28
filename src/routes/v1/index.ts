import { FastifyInstance } from 'fastify';
import { githubRoutes } from './github.route.js';
import { leetcodeRoutes } from './leetcode.route.js';
import { statsRoutes } from './stats.route.js';

export async function v1Routes(fastify: FastifyInstance) {
  fastify.register(githubRoutes);
  fastify.register(leetcodeRoutes);
  fastify.register(statsRoutes);
}
