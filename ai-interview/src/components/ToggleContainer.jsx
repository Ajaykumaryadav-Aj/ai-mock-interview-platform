import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Sparkles, ArrowRight } from "lucide-react";
import NavigationRoutes from "./NavigationRoutes";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@clerk/clerk-react";
import LogoContainer from "./LogoContainer";

export const ToggleContainer = () => {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 md:hidden transition-colors" aria-label="Open mobile menu">
        <Menu className="w-5 h-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[360px] p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          <SheetHeader className="pb-4 border-b border-gray-100 text-left">
            <SheetTitle className="flex items-center gap-2">
              <LogoContainer />
            </SheetTitle>
          </SheetHeader>

          <div className="py-6">
            <NavigationRoutes isMobile onItemClick={() => setOpen(false)} />
          </div>
        </div>

        {/* Bottom Mobile Action Buttons */}
        <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
          {isSignedIn ? (
            <Link to="/generate" onClick={() => setOpen(false)}>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl">
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/generate" onClick={() => setOpen(false)}>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs">
                  Start Free Interview <Sparkles className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link to="/signin" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ToggleContainer;
