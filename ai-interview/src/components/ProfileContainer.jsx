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
    <div className="flex items-center gap-1.5 sm:gap-2.5">
      <Link
        to="/signin"
        className="hidden sm:inline-flex text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-1.5 sm:px-2 py-1 whitespace-nowrap"
      >
        Sign In
      </Link>
      <Link to="/generate">
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-4 rounded-xl shadow-xs transition-all hover:scale-[1.02] whitespace-nowrap"
        >
          <span className="hidden md:inline">Start Free Interview</span>
          <span className="md:hidden">Start Free</span>
        </Button>
      </Link>
    </div>
  );
};

export default ProfileContainer;
