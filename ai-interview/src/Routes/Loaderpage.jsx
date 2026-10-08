import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

export const LoaderPage = ({ className }) => {
  return (
    <div
      className={cn(
        "w-full min-h-[50vh] flex flex-col items-center justify-center gap-3 bg-transparent",
        className
      )}
      role="status"
      aria-label="Loading content"
    >
      <Loader className="w-7 h-7 min-w-7 min-h-7 animate-spin text-emerald-600" />
    </div>
  );
};

export default LoaderPage;
