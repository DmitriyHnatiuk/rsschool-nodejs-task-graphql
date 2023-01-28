import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changePostBodySchema, createPostBodySchema } from './schema';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    const posts = await fastify.db.posts.findMany();
    return reply.send(posts);
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
        const posts = await fastify.db.posts.findOne({
          key: "id",
          equals: request.params.id,
        });
        if (!posts) {
          return reply.send(fastify.httpErrors.notFound());
        }
        return reply.send(posts);
      } catch (error) {
        return reply.send(fastify.httpErrors.badRequest());
      }
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
        const post = await fastify.db.posts.create(request.body);
        return reply.send(post);
      } catch (error) {
        return reply.send(fastify.httpErrors.badRequest());
      }
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
        await fastify.db.posts.delete(request.params.id);
        return reply.send();
      } catch (error) {
        return reply.send(fastify.httpErrors.badRequest());
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
        const post = await fastify.db.posts.change(
          request.params.id,
          request.body
        );
        return reply.send(post);
      } catch (error) {
        return reply.send(fastify.httpErrors.badRequest());
      }
    }
  );
};

export default plugin;
