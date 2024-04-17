import { defaults } from "../default";

export const authEndpoints = {
  registration: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/auth/register",
    },
  },
  userLogin: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/auth/login/user",
    },
  },
  searchUser: {
    v1: {
      ...defaults.methods.GET,
      ...defaults.versions.v1,
      uri: "/user/search",
    },
  },
  createConversation: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "message/conversation",
    },
  },
  getSingleUser: {
    v1: {
      ...defaults.methods.GET,
      ...defaults.versions.v1,
      uri: "user/getuser",
    },
  },
};
