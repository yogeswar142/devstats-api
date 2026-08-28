import { FastifyInstance } from 'fastify';
import { StatsService } from '../../services/stats.service.js';
import { ProviderError } from '../../common/errors/provider.error.js';

const statsService = new StatsService();

export async function statsRoutes(fastify: FastifyInstance) {
  fastify.get('/stats', async (request, reply) => {
    try {
      const { githubUsername, leetcodeUsername } = request.query as {
        githubUsername?: string;
        leetcodeUsername?: string;
      };

      const result = await statsService.getAggregatedStats({
        github: githubUsername,
        leetcode: leetcodeUsername,
      });

      return reply.status(result.statusCode).send(result.data);
    } catch (error: any) {
      if (error instanceof ProviderError) {
        return reply.status(error.statusCode).send({
          error: error.name,
          provider: error.provider,
          message: error.message,
        });
      }
      return reply.status(500).send({
        error: 'InternalServerError',
        message: 'An unexpected error occurred while aggregating developer statistics',
      });
    }
  });
}
