import React from "react";
import Link from "next/link";

function AuthFooter(props) {
  return (
    <div className="px-3 mt-6 text-sm">
      {props.type === "signup" && (
        <>
          {props.showAgreement && (
            <div className="mb-3">
              By signing up, you are agreeing to our{" "}
              <Link href={props.termsPath}>
                <a className="text-blue-600">Terms of Service</a>
              </Link>{" "}
              and{" "}
              <Link href={props.privacyPolicyPath}>
                <a className="text-blue-600">Privacy Policy</a>
              </Link>
              .
            </div>
          )}

          {props.signinText}
          <Link href={props.signinPath}>
            <a className="ml-3 text-blue-600">{props.signinAction}</a>
          </Link>
        </>
      )}

      {props.type === "signin" && (
        <>
          <Link href={props.signupPath}>
            <a className="text-blue-600">{props.signupAction}</a>
          </Link>

          {props.forgotPassAction && (
            <Link href={props.forgotPassPath}>
              <a className="ml-4 text-blue-600">{props.forgotPassAction}</a>
            </Link>
          )}
        </>
      )}

      {props.type === "forgotpass" && (
        <>
          {props.signinText}
          <Link href={props.signinPath}>
            <a className="ml-3 text-blue-600">{props.signinAction}</a>
          </Link>
        </>
      )}
    </div>
  );
}

export default AuthFooter;
