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
  getConversationList: {
    v1: {
      ...defaults.methods.GET,
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
  messageList: {
    v1: {
      ...defaults.methods.GET,
      ...defaults.versions.v1,
      uri: "message",
    },
  },
  latestMessageList: {
    v1: {
      ...defaults.methods.GET,
      ...defaults.versions.v1,
      uri: "message/current",
    },
  },
  createGroupApi: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "message/creategroup",
    },
  },
  uploadImageAPI: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "upload",
    },
  },
  messageSoftDelete: {
    v1: {
      ...defaults.methods.DELETE,
      ...defaults.versions.v1,
      uri: "message/softdelete",
    },
  },
};
