import { useAuth } from "@clerk/clerk-react";
import LoaderPage from "@/Routes/Loaderpage";
import { Navigate } from "react-router-dom";
import { SEO } from "@/components/SEO";

const ProtectedRoutes = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <LoaderPage />;
  }

  if (!isSignedIn) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <>
      <SEO noindex={true} nofollow={true} title="Dashboard" />
      {children}
    </>
  );
};

export default ProtectedRoutes;
