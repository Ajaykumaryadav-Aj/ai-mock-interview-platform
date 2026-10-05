import { Link } from "react-router-dom";

const LogoContainer = () => {
  return (
    <Link to="/" className="flex items-center gap-2.5 group shrink-0">
      <img
        src="/assets/svg/logo.svg"
        alt="MocInterview - AI Mock Interview Platform Logo"
        width="34"
        height="34"
        className="w-8 h-8 object-contain transition-transform duration-200 group-hover:scale-105"
      />
      <span className="font-extrabold text-xl tracking-tight text-gray-900 group-hover:text-emerald-700 transition-colors">
        Moc<span className="text-emerald-600">Interview</span>
      </span>
    </Link>
  );
};

export default LogoContainer;
