import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./Auth";

const PrivateRoute = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    // Redirect to the login page if the user is not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render the protected component if the user is authenticated
  return children;
};

export default PrivateRoute;
