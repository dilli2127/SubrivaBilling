import React, { useEffect, useCallback } from "react";
import type { ApiRequest } from "../../services/api/apiService";
import { dynamic_request } from "../../services/redux";
import { useDispatch } from "react-redux";
import type { Dispatch } from "redux";
import { createApiRouteGetter } from "../../helpers/Common_functions";

const LandingBanner: React.FC = () => {
  const getApiRouteCmsImage = createApiRouteGetter("CmsImage");
  const getImageRoute = getApiRouteCmsImage("GetAll");
  const dispatch: Dispatch<any> = useDispatch();
  const callBackServer = useCallback(
    (variables: ApiRequest, key: string) => {
      dispatch(dynamic_request(variables, key));
    },
    [dispatch]
  );

  const getAllImages = () => {
    callBackServer(
      {
        method: getImageRoute.method,
        endpoint: getImageRoute.endpoint,
        data: { pageLimit: 100 },
      },
      getImageRoute.identifier
    );
  };
  useEffect(() => {
    getAllImages();
  }, []);

  return <></>;
};

export default LandingBanner;
