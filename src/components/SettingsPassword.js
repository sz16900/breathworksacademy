import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "util/auth";

function SettingsPassword(props) {
  const auth = useAuth();
  const [pending, setPending] = useState(false);

  const { register, handleSubmit, errors, reset, getValues } = useForm();

  const onSubmit = (data) => {
    // Show pending indicator
    setPending(true);

    auth
      .updatePassword(data.pass)
      .then(() => {
        // Clear form
        reset();
        // Set success status
        props.onStatus({
          type: "success",
          message: "Your password has been updated",
        });
      })
      .catch((error) => {
        if (error.code === "auth/requires-recent-login") {
          // Update state to show re-authentication modal
          props.onStatus({
            type: "requires-recent-login",
            // Resubmit after reauth flow
            callback: () => onSubmit({ pass: data.pass }),
          });
        } else {
          // Set error status
          props.onStatus({
            type: "error",
            message: error.message,
          });
        }
      })
      .finally(() => {
        // Hide pending indicator
        setPending(false);
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        Password
        <input
          className="py-1 px-3 w-full leading-8 bg-white rounded border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 mt-1"
          name="pass"
          type="password"
          placeholder="Password"
          ref={register({
            required: "Please enter a password",
          })}
        />
        {errors.pass && (
          <p className="mt-1 text-sm text-left text-red-600">
            {errors.pass.message}
          </p>
        )}
      </div>
      <div className="mt-3">
        Confirm New Password
        <input
          className="py-1 px-3 w-full leading-8 bg-white rounded border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 mt-1"
          name="confirmPass"
          type="password"
          placeholder="Confirm Password"
          ref={register({
            required: "Please enter your new password again",
            validate: (value) => {
              if (value === getValues().pass) {
                return true;
              } else {
                return "This doesn't match your password";
              }
            },
          })}
        />
        {errors.confirmPass && (
          <p className="mt-1 text-sm text-left text-red-600">
            {errors.confirmPass.message}
          </p>
        )}
      </div>
      <button
        className="py-2 px-4 w-full text-white bg-blue-500 rounded border-0 hover:bg-blue-600 focus:outline-none mt-4"
        type="submit"
        disabled={pending}
      >
        {pending ? "..." : "Save"}
      </button>
    </form>
  );
}

export default SettingsPassword;
