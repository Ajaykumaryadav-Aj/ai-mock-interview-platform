import { SignUp } from "@clerk/clerk-react";
import { SEO } from "@/components/SEO";

export const SignUpPage = () => {
  return (
    <>
      <SEO title="Create Account | MocInterview" noindex={true} nofollow={true} />
      <SignUp path="/signup" routing="path" signInUrl="/signin" />
    </>
  );
};

export default SignUpPage;
