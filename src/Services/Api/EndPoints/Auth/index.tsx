import { defaults } from "../../default";

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
};
