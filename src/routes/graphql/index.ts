import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { GraphQLSchema, graphql } from "graphql";

import { RootMutationType } from "./mutationSchema";
import { RootQueryType } from "./querySchema";
import { graphqlBodySchema } from "./schema";

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    "/",
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      return await graphql({
        schema,
        source: String(request.body.query),
        contextValue: fastify.db,
        variableValues: request.body.variables,
      });
    }
  );
};

export default plugin;
