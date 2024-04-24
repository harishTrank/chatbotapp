import { callApi } from "../../../Utils/apiUtils";
import { authEndpoints } from "../EndPoints";

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

export const getConversationList = ({ query }: any) =>
  callApi({
    uriEndPoint: authEndpoints.getConversationList.v1,
    query,
  });

export const getSingleUser = ({ query }: any) =>
  callApi({
    uriEndPoint: authEndpoints.getSingleUser.v1,
    query,
  });

export const messageList = ({ query }: any) =>
  callApi({
    uriEndPoint: authEndpoints.messageList.v1,
    query,
  });

export const latestMessageList = ({ query }: any) =>
  callApi({
    uriEndPoint: authEndpoints.latestMessageList.v1,
    query,
  });
export const createGroupApi = ({ body }: any) =>
  callApi({
    uriEndPoint: authEndpoints.createGroupApi.v1,
    body,
  });

export const uploadImageAPI = ({ body }: any) =>
  callApi({
    uriEndPoint: authEndpoints.uploadImageAPI.v1,
    body,
    multipart: true,
  });

export const messageSoftDelete = ({ query }: any) =>
  callApi({
    uriEndPoint: authEndpoints.messageSoftDelete.v1,
    query,
  });
