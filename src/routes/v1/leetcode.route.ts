import { FastifyInstance } from 'fastify';
import { LeetCodeProvider } from '../../providers/leetcode/leetcode.provider.js';
import { ProviderError } from '../../common/errors/provider.error.js';

const leetcodeProvider = new LeetCodeProvider();

export async function leetcodeRoutes(fastify: FastifyInstance) {
  fastify.get('/leetcode', async (request, reply) => {
    try {
      const { username } = request.query as { username?: string };
      const stats = await leetcodeProvider.fetchStats(username);
      return reply.status(200).send(stats);
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
        message: 'An unexpected error occurred while fetching LeetCode statistics',
      });
    }
  });
}
