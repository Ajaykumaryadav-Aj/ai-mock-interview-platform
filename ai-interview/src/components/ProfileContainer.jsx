import { useAuth, UserButton } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export const ProfileContainer = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex items-center">
        <Loader className="w-4 h-4 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link to="/generate" className="hidden sm:inline-flex">
          <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-9 px-3.5 text-xs font-semibold">
            Dashboard
          </Button>
        </Link>
        <UserButton afterSignOutUrl="/" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        to="/signin"
        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-2 py-1"
      >
        Sign In
      </Link>
      <Link to="/generate">
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm h-9 px-3.5 sm:px-4 rounded-xl shadow-xs transition-all hover:scale-[1.02]"
        >
          Start Free Interview
        </Button>
      </Link>
    </div>
  );
};

export default ProfileContainer;
