import { useAuth } from "@clerk/clerk-react";
import LoaderPage from "@/Routes/Loaderpage";
import { Navigate } from "react-router-dom";

const ProtectedRoutes = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <LoaderPage />;
  }

  if (!isSignedIn) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoutes;
