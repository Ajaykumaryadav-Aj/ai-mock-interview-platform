import { SignIn } from "@clerk/clerk-react";
import { SEO } from "@/components/SEO";

export const SignInPage = () => {
  return (
    <>
      <SEO title="Sign In | MocInterview" noindex={true} nofollow={true} />
      <SignIn path="/signin" routing="path" signUpUrl="/signup" />
    </>
  );
};

export default SignInPage;
