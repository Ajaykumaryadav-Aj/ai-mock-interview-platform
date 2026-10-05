import { Outlet } from "react-router-dom";
import { SEO } from "@/components/SEO";

export default function AuthenticationLayout() {
  return (
    <div className="w-screen h-screen flex items-center justify-center relative">
      <SEO noindex={true} nofollow={true} title="Authentication" />
      <img
        src="/assets/img/bg.png"
        className="absolute w-full h-full object-cover opacity-20 pointer-events-none"
        alt=""
      />
      <Outlet />
    </div>
  );
}
