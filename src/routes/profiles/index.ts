import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import type { ProfileEntity } from "../../utils/DB/entities/DBProfiles";
import { idParamSchema } from "../../utils/reusedSchemas";
import { changeProfileBodySchema, createProfileBodySchema } from "./schema";

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get("/", async function (request, reply): Promise<ProfileEntity[]> {
    const profiles = await fastify.db.profiles.findMany();
    return reply.send(profiles);
  });

  fastify.get(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      try {
        const profile = await fastify.db.profiles.findOne({
          key: "id",
          equals: request.params.id,
        });

        if (!profile) {
          return reply.send(fastify.httpErrors.notFound());
        }
        return reply.send(profile);
      } catch (error) {
        return reply.send(fastify.httpErrors.badRequest());
      }
    }
  );

  fastify.post(
    "/",
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      try {
        const member = await fastify.db.memberTypes.findOne({
          key: "id",
          equals: request.body.memberTypeId,
        });
        const profileExist = await fastify.db.profiles.findOne({
          key: "userId",
          equals: request.body.userId,
        });

        if (!member || profileExist) {
          return reply.send(fastify.httpErrors.badRequest());
        }
        const profile = await fastify.db.profiles.create(request.body);
        return reply.send(profile);
      } catch (error) {
        return reply.send(fastify.httpErrors.badRequest());
      }
    }
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      try {
        const profile = await fastify.db.profiles.delete(request.params.id);
        return reply.send(profile);
      } catch (error) {
        return reply.send(fastify.httpErrors.badRequest());
      }
    }
  );

  fastify.patch(
    "/:id",
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      try {
        const profile = await fastify.db.profiles.change(
          request.params.id,
          request.body
        );
        return reply.send(profile);
      } catch (error) {
        return reply.send(fastify.httpErrors.badRequest());
      }
    }
  );
};

export default plugin;
