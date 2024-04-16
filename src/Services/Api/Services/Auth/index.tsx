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
