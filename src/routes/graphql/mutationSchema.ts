import {
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";

import DB from "../../utils/DB/DB";
import {
  CreateUserInput,
  MemberType,
  PostType,
  ProfileType,
  UpdateMemberTypeInput,
  UserType,
} from "./schema";

export const RootMutationType = new GraphQLObjectType({
  name: "mutation",
  fields: () => ({
    addUsers: {
      type: UserType,
      description: "Add Users",
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (source, args, context: DB) => context.users.create(args),
    },

    addUserInputType: {
      type: UserType,
      args: { input: { type: CreateUserInput } },
      resolve: (source, args, context: DB) => context.users.create(args.input),
    },

    changeUsers: {
      type: UserType,
      description: "Change users",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID!) },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
      },
      resolve: async (source, args, context: DB) => {
        try {
          const user = await context.users.findOne({
            key: "id",
            equals: args.id,
          });
          if (!user) {
            throw new Error(`User not Exist ${args.id}`);
          }

          return context.users.change(args.id, args);
        } catch (error) {
          return error;
        }
      },
    },

    addPost: {
      type: PostType,
      description: "Add Post",
      args: {
        title: { type: new GraphQLNonNull(GraphQLString!) },
        content: { type: new GraphQLNonNull(GraphQLString!) },
        userId: { type: new GraphQLNonNull(GraphQLID!) },
      },
      resolve: async (source, args, context: DB) => {
        try {
          const { userId } = args;
          if (userId) {
            const user = await context.users.findOne({
              key: "id",
              equals: userId,
            });
            if (user) {
              return context.posts.create(args);
            }
            throw new Error(`User id:${userId} not exist`);
          }
        } catch (error) {
          return error;
        }
      },
    },

    changePost: {
      type: PostType,
      description: "Change post",
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID!) },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
      },
      resolve: async (source, args, context: DB) => {
        try {
          const post = await context.posts.findOne({
            key: "userId",
            equals: args.userId,
          });

          if (!post) {
            throw new Error(`Post not Exist ${args.userId}`);
          }

          return context.posts.change(post.id, args);
        } catch (error) {
          return error;
        }
      },
    },

    addProfile: {
      type: ProfileType,
      description: "Add a new profile",
      args: {
        avatar: { type: new GraphQLNonNull(GraphQLString!) },
        sex: { type: new GraphQLNonNull(GraphQLString!) },
        birthday: { type: new GraphQLNonNull(GraphQLInt!) },
        country: { type: new GraphQLNonNull(GraphQLString!) },
        street: { type: new GraphQLNonNull(GraphQLString!) },
        city: { type: new GraphQLNonNull(GraphQLString!) },
        memberTypeId: { type: new GraphQLNonNull(GraphQLString!) },
        userId: { type: new GraphQLNonNull(GraphQLID!) },
      },
      resolve: async (source, args, context: DB) => {
        try {
          const { userId } = args;
          if (
            args.memberTypeId !== "basic" &&
            args.memberTypeId !== "business"
          ) {
            throw new Error('memberTypeId not to equal "basic" or "business"');
          }
          if (userId) {
            const user = await context.users.findOne({
              key: "id",
              equals: userId,
            });
            const profile = await context.profiles.findOne({
              key: "userId",
              equals: userId,
            });
            if (profile) throw new Error(`Profile id:${userId} exist`);
            if (user) {
              return context.profiles.create(args);
            }
            throw new Error(`User id:${userId} not exist`);
          }
        } catch (error) {
          return error;
        }
      },
    },

    changeProfile: {
      type: ProfileType,
      description: "Change profile",
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
        avatar: { type: GraphQLString },
        sex: { type: GraphQLString },
        birthday: { type: GraphQLInt },
        country: { type: GraphQLString },
        street: { type: GraphQLString },
        city: { type: GraphQLString },
        memberTypeId: { type: GraphQLString },
      },
      resolve: async (source, args, context: DB) => {
        try {
          const profile = await context.profiles.findOne({
            key: "userId",
            equals: args.userId,
          });
          if (!profile) {
            throw new Error(`Profile not Exist ${args.userId}`);
          }
          const { id: _id, ...rest } = args;
          return context.profiles.change(profile.id, rest);
        } catch (error) {
          return error;
        }
      },
    },

    subscribedToUser: {
      type: UserType,
      description: "Subscribe",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID!) },
        userId: { type: new GraphQLNonNull(GraphQLID!) },
      },
      resolve: async (source, args, context: DB) => {
        try {
          const { id, userId } = args;
          if (id && userId && id !== userId) {
            const user = await context.users.findOne({
              key: "id",
              equals: id,
            });

            if (user) {
              const isSubscribed = user.subscribedToUserIds.includes(userId);
              if (isSubscribed) {
                const filteredSubscribes = user.subscribedToUserIds.filter(
                  (user: string) => user !== userId
                );

                return context.users.change(id, {
                  subscribedToUserIds: filteredSubscribes,
                });
              }
              return context.users.change(id, {
                subscribedToUserIds: [
                  ...new Set([...user.subscribedToUserIds, userId]),
                ],
              });
            }
          }
          throw new Error(`Error: userId:${userId} id:${id}`);
        } catch (error) {
          return error;
        }
      },
    },

    updateMemberTypes: {
      type: MemberType,
      description: "Update Member Type",
      args: {
        id: { type: GraphQLString },
        discount: { type: GraphQLInt },
        monthPostsLimit: { type: GraphQLInt! },
      },
      resolve: async (source, args, context: DB) => {
        try {
          if (args.id !== "basic" && args.id !== "business") {
            throw new Error('id is not equal to "basic" or "business"');
          }
          const memberType = await context.memberTypes.findOne({
            key: "id",
            equals: args.id,
          });
          if (!memberType) {
            throw new Error(`Member type not exist ${args.id}`);
          }
          return context.memberTypes.change(args.id, args);
        } catch (error) {
          return error;
        }
      },
    },

    updateMemberTypeInput: {
      type: MemberType,
      args: { input: { type: UpdateMemberTypeInput } },
      resolve: async (source, args, context: DB) => {
        try {
          if (args.input.id !== "basic" && args.input.id !== "business") {
            throw new Error('id is not equal to "basic" or "business"');
          }
          const memberType = await context.memberTypes.findOne({
            key: "id",
            equals: args.input.id,
          });
          if (!memberType) {
            throw new Error(`Member type not exist ${args.input.id}`);
          }
          return context.memberTypes.change(args.input.id, args.input);
        } catch (error) {
          return error;
        }
      },
    },
  }),
});
