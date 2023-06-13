import React, { useState } from "react";
import { useAuth } from "util/auth";

function AuthSocial(props) {
  const auth = useAuth();
  const [pending, setPending] = useState(null);

  const providerDisplayNames = {
    google: "Google",
    facebook: "Facebook",
    twitter: "Twitter",
    github: "GitHub",
  };

  const onSigninWithProvider = (provider) => {
    setPending(provider);
    auth
      .signinWithProvider(provider)
      .then((user) => {
        // Remember this provider was last used
        // so we can indicate for next login.
        localStorage.setItem("lastUsedAuthProvider", provider);
        props.onAuth(user);
      })
      .catch((error) => {
        setPending(null);
        props.onError(error.message);
      });
  };

  return (
    <div className="mt-8">
      {props.providers.map((provider) => (
        <div className="mb-2" key={provider}>
          <button
            className="py-2 px-4 w-full bg-gray-200 rounded border-0 hover:bg-gray-300 focus:outline-none"
            onClick={() => {
              onSigninWithProvider(provider);
            }}
            disabled={pending === provider}
          >
            {pending === provider && <>...</>}

            {pending !== provider && (
              <>
                {props.buttonAction} with {providerDisplayNames[provider]}
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

export default AuthSocial;
