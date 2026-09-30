import { SignUp } from "@clerk/clerk-react";

export const SignUpPage = () => {
  return <SignUp path="/signup" routing="path" signInUrl="/signin" />;
};

export default SignUpPage;
