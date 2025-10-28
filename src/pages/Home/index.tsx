import React from "react";
import { apiSlice } from "../../services/redux/api/apiSlice";

const LandingBanner: React.FC = () => {
  // Use RTK Query to fetch CMS images
  const { data: imagesData, isLoading: loading } = apiSlice.useGetCmsImageQuery({
    pageLimit: 100,
  });

  // Images are automatically fetched on mount
  // No manual fetch needed

  return <></>;
};

export default LandingBanner;
