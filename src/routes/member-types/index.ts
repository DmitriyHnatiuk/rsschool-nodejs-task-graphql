import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    MemberTypeEntity[]
  > {
    const members = await fastify.db.memberTypes.findMany();
    return reply.send(members);
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      try {
        const member = await fastify.db.memberTypes.findOne({
          key: "id",
          equals: request.params.id,
        });

        if (!member) {
          return reply.send(fastify.httpErrors.notFound());
        }
        return reply.send(member);
      } catch (e) {
        return reply.send(fastify.httpErrors.badRequest());
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      try {
        const member = await fastify.db.memberTypes.findOne({
          key: "id",
          equals: request.params.id,
        });

        if (!member) {
          return reply.send(fastify.httpErrors.badRequest());
        }
        const result = await fastify.db.memberTypes.change(
          request.params.id,
          request.body
        );
        return reply.send(result);
      } catch (error) {
        return reply.send(fastify.httpErrors.badRequest());
      }
    }
  );
};

export default plugin;
