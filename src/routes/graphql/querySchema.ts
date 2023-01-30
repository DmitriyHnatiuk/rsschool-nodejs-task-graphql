import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import DB from "../../utils/DB/DB";
import {
  MemberType,
  PostType,
  ProfileType,
  UserType,
  UsersTypes,
} from "./schema";

export const RootQueryType = new GraphQLObjectType({
  name: "query",
  fields: () => ({
    users: {
      type: new GraphQLList(UsersTypes),
      description: "Users",
      resolve: (source, args, context: DB) => context.users.findMany(),
    },

    user: {
      type: UserType,
      description: "User by id",
      args: {
        id: { type: new GraphQLNonNull(GraphQLID!) },
      },
      resolve: async (source: string, args: { id: string }, context: DB) => {
        try {
          const user = await context.users.findOne({
            key: "id",
            equals: args.id,
          });
          if (!user) {
            throw new Error(args.id);
          }
          return user;
        } catch (error) {
          return error;
        }
      },
    },

    profiles: {
      type: new GraphQLList(ProfileType),
      description: "Profiles",
      resolve: (source, args, context: DB) => context.profiles.findMany(),
    },

    profile: {
      type: ProfileType,
      description: "Profile by id",

      args: {
        id: { type: new GraphQLNonNull(GraphQLID!) },
      },
      resolve: async (source: string, args: { id: string }, context: DB) => {
        try {
          const profile = await context.profiles.findOne({
            key: "id",
            equals: args.id,
          });

          if (!profile) {
            throw new Error(args.id);
          }
          return profile;
        } catch (error) {
          return error;
        }
      },
    },

    posts: {
      type: new GraphQLList(PostType),
      description: "Posts",
      resolve: (source, args, context: DB) => context.posts.findMany(),
    },

    post: {
      type: PostType,
      description: "Post by id",
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID!) },
      },
      resolve: async (source, args, context: DB) => {
        try {
          const post = await context.posts.findOne({
            key: "userId",
            equals: args.userId,
          });

          if (!post) {
            throw new Error(args.userId);
          }

          return post;
        } catch (error) {
          return error;
        }
      },
    },

    memberTypes: {
      type: new GraphQLList(MemberType),
      description: "Members Types",
      resolve: (source, args, context: DB) => context.memberTypes.findMany(),
    },

    memberType: {
      type: MemberType,
      description: "Member type by id",
      args: {
        id: { type: new GraphQLNonNull(GraphQLString!) },
      },
      resolve: async (source, args, context: DB) => {
        try {
          const _member = await context.memberTypes.findOne({
            key: "id",
            equals: args.id,
          });

          if (!_member) {
            throw new Error(args.id);
          }
          return _member;
        } catch (error) {
          return error;
        }
      },
    },
  }),
});
