import React, {
  useState,
  useEffect,
  useMemo,
  useContext,
  createContext,
} from "react";
import queryString from "query-string";
import supabase from "./supabase";
import { useUser, updateUser } from "./db";
import router from "next/router";
import PageLoader from "./../components/PageLoader";
import { getFriendlyPlanId } from "./prices";
import analytics from "./analytics";

// Whether to merge extra user data from database into `auth.user`
const MERGE_DB_USER = true;

// Whether to connect analytics session to `user.uid`
const ANALYTICS_IDENTIFY = true;

// Create a `useAuth` hook and `AuthProvider` that enables
// any component to subscribe to auth and re-render when it changes.
const authContext = createContext();
export const useAuth = () => useContext(authContext);
// This should wrap the app in `src/pages/_app.js`
export function AuthProvider({ children }) {
  const auth = useAuthProvider();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

// Hook that creates the `auth` object and handles state
// This is called from `AuthProvider` above (extracted out for readability)
function useAuthProvider() {
  // Store auth user in state
  // `user` will be object, `null` (loading) or `false` (logged out)
  const [user, setUser] = useState(null);

  // Merge extra user data from the database
  // This means extra user data (such as payment plan) is available as part
  // of `auth.user` and doesn't need to be fetched separately. Convenient!
  let finalUser = useMergeExtraData(user, { enabled: MERGE_DB_USER });

  // Add custom fields and formatting to the `user` object
  finalUser = useFormatUser(finalUser);

  // Connect analytics session to user
  useIdentifyUser(finalUser, { enabled: ANALYTICS_IDENTIFY });

  // Handle response from auth functions (`signup`, `signin`, and `signinWithProvider`)
  const handleAuth = async (response) => {
    const {
      data: { user },
    } = response;

    // If email is unconfirmed throw error to be displayed in UI
    // The user will be confirmed automatically if email confirmation is disabled in Supabase settings
    if (!user.email_confirmed_at) {
      throw new Error(
        "Thanks for signing up! Please check your email to complete the process."
      );
    }

    // Update user in state
    setUser(user);
    return user;
  };

  const signup = (email, password) => {
    return supabase.auth
      .signUp({ email, password })
      .then(handleError)
      .then(handleAuth);
  };

  const signin = (email, password) => {
    return supabase.auth
      .signInWithPassword({ email, password })
      .then(handleError)
      .then(handleAuth);
  };

  const signinWithProvider = (name) => {
    return (
      supabase.auth
        .signInWithOAuth({
          provider: name,
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
          },
        })
        .then(handleError)
        // Because `signInWithOAuth` resolves immediately we need to add this so
        // it never resolves (component will display loading indicator indefinitely).
        // Once social signin is completed the page will redirect to value of `redirectTo`.
        .then(() => {
          return new Promise(() => null);
        })
    );
  };

  const signinWithMagicLink = (email) => {
    return supabase.auth
      .signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })
      .then(handleError);
  };

  const signout = () => {
    return supabase.auth.signOut().then(handleError);
  };

  const sendPasswordResetEmail = (email) => {
    return supabase.auth
      .resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/changepass`,
      })
      .then(handleError);
  };

  const confirmPasswordReset = (password) => {
    return supabase.auth.updateUser({ password }).then(handleError);
  };

  const updatePassword = (password) => {
    return supabase.auth.updateUser({ password }).then(handleError);
  };

  // Update auth user and persist data to database
  // Call this function instead of multiple auth/db update functions
  const updateProfile = async (data) => {
    const { email, ...other } = data;

    // If email changed let them know to click the confirmation links
    // Will be persisted to the database by our Supabase trigger once process is completed
    if (email && email !== user.email) {
      await supabase.auth.updateUser({ email }).then(handleError);
      throw new Error(
        "To complete this process click the confirmation links sent to your new and old email addresses"
      );
    }

    // Persist all other data to the database
    if (Object.keys(other).length > 0) {
      await updateUser(user.id, other);
    }
  };

  useEffect(() => {
    // Get hash portion of URL if coming from Supabase OAuth or magic link flow.
    // Store on `window` so we can access in other functions after hash is removed.
    window.lastHash = queryString.parse(window.location.hash);

    // If we have an `access_token` from OAuth or magic link flow avoid using
    // cached session so that user is `null` (loading state) until process completes.
    // Otherwise, a redirect to a protected page after social auth will redirect
    // right back to login due to cached session indicating they are logged out.
    if (!window.lastHash.access_token) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser(session.user);
        } else {
          setUser(false);
        }
      });
    }

    // Subscribe to user on mount
    const {
      data: {
        subscription: { unsubscribe },
      },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(false);
      }
    });

    // Unsubscribe on cleanup
    return () => unsubscribe();
  }, []);

  return {
    user: finalUser,
    signup,
    signin,
    signinWithProvider,
    signinWithMagicLink,
    signout,
    sendPasswordResetEmail,
    confirmPasswordReset,
    updatePassword,
    updateProfile,
  };
}

function useFormatUser(user) {
  // Memoize so returned object has a stable identity
  return useMemo(() => {
    // Return if auth user is `null` (loading) or `false` (not authenticated)
    if (!user) return user;

    // Create an array of user's auth providers by id (["password", "google", etc])
    // Components can read this to prompt user to re-auth with the correct provider
    let provider = user.app_metadata.provider;
    // Supabase calls it "email", but our components expect "password"
    if (provider === "email") provider = "password";
    const providers = [provider];

    // Get customer data
    const customer = user.customers || {};

    return {
      // Include full auth user data
      ...user,
      // Alter the names of some fields
      uid: user.id,
      // User's auth providers
      providers: providers,
      // Add customer data
      ...customer,
      // Add `planId` (starter, pro, etc) based on Stripe Price ID
      ...(customer.stripePriceId && {
        planId: getFriendlyPlanId(customer.stripePriceId),
      }),
      // Add `planIsActive: true` if subscription status is active or trialing
      planIsActive: ["active", "trialing"].includes(
        customer.stripeSubscriptionStatus
      ),
    };
  }, [user]);
}

function useMergeExtraData(user, { enabled }) {
  // Get extra user data from database
  const { data, status, error } = useUser(enabled && user && user.id);

  // Memoize so returned object has a stable identity
  return useMemo(() => {
    // If disabled or no auth user (yet) then just return
    if (!enabled || !user) return user;

    switch (status) {
      case "success":
        // If successful, but `data` is `null`, that means user just signed up and the `createUser`
        // function hasn't populated the db yet. Return `null` to indicate auth is still loading.
        // The above call to `useUser` will re-render things once the data comes in.
        if (data === null) return null;
        // Return auth `user` merged with extra user `data`
        return { ...user, ...data };
      case "error":
        // Uh oh.. Let's at least show a helpful error.
        throw new Error(`
          Error: ${error.message}
          This happened while attempting to fetch extra user data from the database
          to include with the authenticated user. Make sure the database is setup or
          disable merging extra user data by setting MERGE_DB_USER to false.
        `);
      default:
        // We have an `idle` or `loading` status so return `null`
        // to indicate that auth is still loading.
        return null;
    }
  }, [user, enabled, data, status, error]);
}

// Connect analytics session to current user
function useIdentifyUser(user, { enabled }) {
  useEffect(() => {
    if (user && enabled) {
      analytics.identify(user.uid);
    }
  }, [user, enabled]);
}

// A Higher Order Component for requiring authentication
export const requireAuth = (Component) => {
  return function RequireAuthHOC(props) {
    // Get authenticated user
    const auth = useAuth();

    useEffect(() => {
      // Redirect if not signed in
      if (auth.user === false) {
        router.replace("/auth/signin");
      }
    }, [auth]);

    // Show loading indicator
    // We're either loading (user is `null`) or about to redirect from above `useEffect` (user is `false`)
    if (!auth.user) {
      return <PageLoader />;
    }

    // Render component now that we have user
    return <Component {...props} />;
  };
};

// Throw error from auth response
// so it can be caught and displayed by UI
function handleError(response) {
  if (response.error) throw response.error;
  return response;
}
