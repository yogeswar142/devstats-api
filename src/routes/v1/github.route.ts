import { FastifyInstance } from 'fastify';
import { GitHubProvider } from '../../providers/github/github.provider.js';
import { ProviderError } from '../../common/errors/provider.error.js';

const githubProvider = new GitHubProvider();

export async function githubRoutes(fastify: FastifyInstance) {
  fastify.get('/github', async (request, reply) => {
    try {
      const { username } = request.query as { username?: string };
      const stats = await githubProvider.fetchStats(username);
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
        message: 'An unexpected error occurred while fetching GitHub statistics',
      });
    }
  });
}
