import { FastifyInstance } from 'fastify';

export async function healthRoutes(fastify: FastifyInstance) {
  const healthHandler = async (_request: any, reply: any) => {
    return reply.status(200).send({
      status: 'ok',
      service: 'devstats-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  };

  fastify.get('/health', healthHandler);
  fastify.get('/', healthHandler);
  fastify.head('/', healthHandler);
}
