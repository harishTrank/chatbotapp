import { callApi } from "../../../../Utils/apiUtils";
import { authEndpoints } from "../../EndPoints/Auth";

export const userRegistration = ({ body }: any) =>
  callApi({
    uriEndPoint: authEndpoints.registration.v1,
    body,
  });

export const userLogin = ({ body }: any) =>
  callApi({
    uriEndPoint: authEndpoints.userLogin.v1,
    body,
  });
export const searchUseApi = ({ query }: any) =>
  callApi({
    uriEndPoint: authEndpoints.searchUser.v1,
    query,
  });
export const createConversation = ({ body }: any) =>
  callApi({
    uriEndPoint: authEndpoints.createConversation.v1,
    body,
  });
