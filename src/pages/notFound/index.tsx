import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../login/login";
import BillingLogin from "../login/billing_login";

const NotFound: React.FC = () => {
  // const navigate = useNavigate()
  // useEffect(() => {
  //   navigate("/admin")
  // }, [])
  return (
    <BillingLogin/>
  );
};

export default NotFound;
