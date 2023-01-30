import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import DB from "../../utils/DB/DB";

export const graphqlBodySchema = {
  type: "object",
  properties: {
    mutation: { type: "string" },
    query: { type: "string" },
    variables: {
      type: "object",
    },
  },
  oneOf: [
    {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string" },
        variables: {
          type: "object",
        },
      },
      additionalProperties: false,
    },
    {
      type: "object",
      required: ["mutation"],
      properties: {
        mutation: { type: "string" },
        variables: {
          type: "object",
        },
      },
      additionalProperties: false,
    },
  ],
} as const;

export const UserType = new GraphQLObjectType({
  name: "user",
  description: "user",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID!) },
    firstName: { type: new GraphQLNonNull(GraphQLString!) },
    lastName: { type: new GraphQLNonNull(GraphQLString!) },
    email: { type: new GraphQLNonNull(GraphQLString!) },
    subscribedToUserIds: { type: new GraphQLList(GraphQLID) },

    subscribedToUser: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "subscribedToUser",
          description: "Users and Posts",
          fields: () => ({
            id: { type: new GraphQLNonNull(GraphQLID!) },
            firstName: { type: new GraphQLNonNull(GraphQLString!) },
            lastName: { type: new GraphQLNonNull(GraphQLString!) },
            email: { type: new GraphQLNonNull(GraphQLString!) },
            subscribedToUserIds: { type: new GraphQLList(GraphQLID) },
            posts: {
              type: new GraphQLList(PostType),
              resolve: (source, args, context: DB, { variableValues }) => {
                return context.posts.findMany({
                  key: "userId",
                  equals: source.id,
                });
              },
            },
          }),
        })
      ),
      description: "Users these are users who are following the current user",
      resolve: async (source, args, context: DB) => {
        return context.users.findMany({
          key: "id",
          equalsAnyOf: source.subscribedToUserIds,
        });
      },
    },

    profile: {
      type: ProfileType,
      resolve: async (source, args, context: DB) => {
        return await context.profiles.findOne({
          key: "userId",
          equals: source.id,
        });
      },
    },

    posts: {
      type: new GraphQLList(PostType),
      resolve: (source, args, context: DB, { variableValues }) => {
        return context.posts.findMany({
          key: "userId",
          equals: source.id,
        });
      },
    },

    memberType: {
      type: MemberType,
      resolve: async (source, args, context: DB) => {
        try {
          const profile = await context.profiles.findOne({
            key: "userId",
            equals: source.id,
          });
          if (profile && profile.memberTypeId) {
            return context.memberTypes.findOne({
              key: "id",
              equals: profile.memberTypeId,
            });
          }
        } catch (error) {
          return error;
        }
      },
    },
  }),
});

export const UsersTypes = new GraphQLObjectType({
  name: "usersType",
  description: "User type with subscribers",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID!) },
    firstName: { type: new GraphQLNonNull(GraphQLString!) },
    lastName: { type: new GraphQLNonNull(GraphQLString!) },
    email: { type: new GraphQLNonNull(GraphQLString!) },
    subscribedToUserIds: { type: new GraphQLList(GraphQLID) },
    profile: {
      type: ProfileType,
      resolve: async (source, args, context: DB) => {
        return await context.profiles.findOne({
          key: "userId",
          equals: source.id,
        });
      },
    },

    userSubscribedTo: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "usersSubscribers",
          description: "Users and Profile",
          fields: () => ({
            id: { type: new GraphQLNonNull(GraphQLID!) },
            firstName: { type: new GraphQLNonNull(GraphQLString!) },
            lastName: { type: new GraphQLNonNull(GraphQLString!) },
            email: { type: new GraphQLNonNull(GraphQLString!) },
            subscribedToUserIds: { type: new GraphQLList(GraphQLID) },

            profile: {
              type: ProfileType,
              resolve: async (source, args, context: DB, info) => {
                return await context.profiles.findOne({
                  key: "userId",
                  equals: source.id,
                });
              },
            },
          }),
        })
      ),
      description: "Users  these are users that the current user is following",
      resolve: (source, args, context: DB) => {
        return context.users.findMany({
          key: "subscribedToUserIds",
          inArray: source.id,
        });
      },
    },

    posts: {
      type: new GraphQLList(PostType),
      resolve: (source, args, context: DB, { variableValues }) => {
        return context.posts.findMany({
          key: "userId",
          equals: source.id,
        });
      },
    },

    memberType: {
      type: MemberType,
      resolve: async (source, args, context: DB) => {
        try {
          const profile = await context.profiles.findOne({
            key: "userId",
            equals: source.id,
          });
          if (profile && profile.memberTypeId) {
            return context.memberTypes.findOne({
              key: "id",
              equals: profile.memberTypeId,
            });
          }
        } catch (error) {
          return error;
        }
      },
    },
  }),
});

export const CreateUserInput = new GraphQLInputObjectType({
  name: "CreateUserInput",
  description: "Create user by input",
  fields: () => ({
    firstName: { type: new GraphQLNonNull(GraphQLString!) },
    lastName: { type: new GraphQLNonNull(GraphQLString!) },
    email: { type: new GraphQLNonNull(GraphQLString!) },
  }),
});

export const ProfileType = new GraphQLObjectType({
  name: "profiles",
  description: "profiles",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID!) },
    avatar: { type: new GraphQLNonNull(GraphQLString!) },
    sex: { type: new GraphQLNonNull(GraphQLString!) },
    birthday: { type: new GraphQLNonNull(GraphQLInt!) },
    country: { type: new GraphQLNonNull(GraphQLString!) },
    street: { type: new GraphQLNonNull(GraphQLString!) },
    city: { type: new GraphQLNonNull(GraphQLString!) },
    memberTypeId: { type: new GraphQLNonNull(GraphQLString!) },
    userId: { type: new GraphQLNonNull(GraphQLID!) },
  }),
});

export const PostType = new GraphQLObjectType({
  name: "post",
  description: "Post",
  fields: () => ({
    title: { type: new GraphQLNonNull(GraphQLString!) },
    content: { type: new GraphQLNonNull(GraphQLString!) },
    userId: { type: new GraphQLNonNull(GraphQLID!) },
  }),
});

export const MemberType = new GraphQLObjectType({
  name: "memberType",
  description: "Member Type",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString!) },
    discount: { type: new GraphQLNonNull(GraphQLInt!) },
    monthPostsLimit: { type: new GraphQLNonNull(GraphQLInt!) },
  }),
});

export const UpdateMemberTypeInput = new GraphQLInputObjectType({
  name: "UpdateMemberTypeInput",
  description: "Update memberType by input",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString!) },
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt! },
  }),
});
