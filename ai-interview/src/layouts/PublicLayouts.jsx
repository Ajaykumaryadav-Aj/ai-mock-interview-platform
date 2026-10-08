import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import Header from "@/components/Header";
import { Outlet } from "react-router-dom";
import LoaderPage from "@/Routes/Loaderpage";

export default function PublicLayouts() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Suspense fallback={<LoaderPage className="w-full min-h-[60vh] py-12" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
