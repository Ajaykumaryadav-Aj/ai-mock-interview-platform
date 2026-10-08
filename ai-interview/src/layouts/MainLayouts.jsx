import { Suspense } from "react";
import Containers from "@/components/Containers";
import { Footer } from "@/components/Footer";
import Header from "@/components/Header";
import { Outlet } from "react-router-dom";
import LoaderPage from "@/Routes/Loaderpage";

const MainLayouts = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Containers className="flex-grow">
        <main className="flex-grow">
          <Suspense fallback={<LoaderPage className="w-full min-h-[60vh] py-12" />}>
            <Outlet />
          </Suspense>
        </main>
      </Containers>
      <Footer />
    </div>
  );
};

export default MainLayouts;
