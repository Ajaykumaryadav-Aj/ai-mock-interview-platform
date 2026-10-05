import Containers from "./Containers";
import LogoContainer from "@/components/LogoContainer";
import NavigationRoutes from "@/components/NavigationRoutes";
import { ProfileContainer } from "./ProfileContainer";
import { ToggleContainer } from "./ToggleContainer";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100/80 bg-white/85 backdrop-blur-md transition-all">
      <Containers className="py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-4 w-full">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-8">
            <LogoContainer />

            {/* Center/Left: Navigation links & dropdowns */}
            <nav className="hidden lg:flex items-center">
              <NavigationRoutes isMobile={false} />
            </nav>
          </div>

          {/* Right: Auth buttons & Mobile trigger */}
          <div className="flex items-center gap-3">
            <ProfileContainer />
            <ToggleContainer />
          </div>
        </div>
      </Containers>
    </header>
  );
};

export default Header;
