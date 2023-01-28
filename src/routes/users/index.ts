import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import type { UserEntity } from "../../utils/DB/entities/DBUsers";
import { idParamSchema } from "../../utils/reusedSchemas";
import {
  changeUserBodySchema,
  createUserBodySchema,
  subscribeBodySchema,
} from "./schemas";

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get("/", async function (request, reply): Promise<UserEntity[]> {
    const users = await fastify.db.users.findMany();
    return reply.send(users);
  });

  fastify.get(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        const user = await fastify.db.users.findOne({
          key: "id",
          equals: request.params.id,
        });
        if (!user) {
          return reply.send(fastify.httpErrors.notFound());
        }
        return reply.send(user);
      } catch (error) {
        return reply.send(fastify.httpErrors.badRequest());
      }
    }
  );

  fastify.post(
    "/",
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        const user = await fastify.db.users.create(request.body);
        return reply.send(user);
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
    async function (request, reply): Promise<UserEntity> {
      try {
        const subscribedUsers = await fastify.db.users.findMany({
          key: "subscribedToUserIds",
          inArray: request.params.id,
        });

        if (Array.isArray(subscribedUsers) && subscribedUsers.length) {
          await subscribedUsers.forEach(async (user) => {
            await fastify.db.users.change(user.id, {
              subscribedToUserIds: user.subscribedToUserIds.filter(
                (_user) => _user !== request.params.id
              ),
            });
          });
        }

        const existProfile = await fastify.db.profiles.findOne({
          key: "userId",
          equals: request.params.id,
        });
        if (existProfile) {
          await fastify.db.profiles.delete(existProfile.id);
        }
        const existPost = await fastify.db.posts.findOne({
          key: "userId",
          equals: request.params.id,
        });
        if (existPost) {
          await fastify.db.posts.delete(existPost.id);
        }

        const users = await fastify.db.users.delete(request.params.id);
        return reply.send(users);
      } catch (error) {
        return reply.send(fastify.httpErrors.badRequest());
      }
    }
  );

  fastify.post(
    "/:id/subscribeTo",
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        const oldUser = await fastify.db.users.findOne({
          key: "id",
          equals: request.body.userId,
        });

        if (oldUser) {
          const user = await fastify.db.users.change(request.body.userId, {
            subscribedToUserIds: [
              ...oldUser.subscribedToUserIds,
              request.params.id,
            ],
          });
          return reply.send(user);
        }
        return reply.send(fastify.httpErrors.notFound());
      } catch (error) {
        return reply.send(fastify.httpErrors.badRequest());
      }
    }
  );

  fastify.post(
    "/:id/unsubscribeFrom",
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        const subscribedUser = await fastify.db.users.findOne({
          key: "id",
          equals: request.body.userId,
        });

        const isSubscribed = subscribedUser?.subscribedToUserIds.includes(
          request.params.id
        );

        if (subscribedUser && isSubscribed) {
          const filteredSubscribes = subscribedUser.subscribedToUserIds.filter(
            (user: string) => user !== request.params.id
          );

          const user = await fastify.db.users.change(request.body.userId, {
            subscribedToUserIds: filteredSubscribes,
          });

          return reply.send(user);
        }

        return reply.send(fastify.httpErrors.badRequest());
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  fastify.patch(
    "/:id",
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        const user = await fastify.db.users.change(
          request.params.id,
          request.body
        );
        return reply.send(user);
      } catch (error) {
        return reply.send(fastify.httpErrors.badRequest());
      }
    }
  );
};

export default plugin;
