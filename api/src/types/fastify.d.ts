import 'fastify';
import '@fastify/jwt';
import '@fastify/multipart';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    admin?: {
      id: string;
      email: string;
    };
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: string;
      email: string;
    };
    user: {
      id: string;
      email: string;
    };
  }
}
