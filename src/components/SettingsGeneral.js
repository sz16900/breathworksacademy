import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "util/auth";

function SettingsGeneral(props) {
  const auth = useAuth();
  const [pending, setPending] = useState(false);

  const { register, handleSubmit, errors } = useForm();

  const onSubmit = (data) => {
    // Show pending indicator
    setPending(true);

    return auth
      .updateProfile(data)
      .then(() => {
        // Set success status
        props.onStatus({
          type: "success",
          message: "Your profile has been updated",
        });
      })
      .catch((error) => {
        if (error.code === "auth/requires-recent-login") {
          props.onStatus({
            type: "requires-recent-login",
            // Resubmit after reauth flow
            callback: () => onSubmit(data),
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
        Name
        <input
          className="py-1 px-3 w-full leading-8 bg-white rounded border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 mt-1"
          name="name"
          type="text"
          placeholder="Name"
          defaultValue={auth.user.name}
          ref={register({
            required: "Please enter your name",
          })}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-left text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>
      <div className="mt-3">
        Email
        <input
          className="py-1 px-3 w-full leading-8 bg-white rounded border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 mt-1"
          name="email"
          type="email"
          placeholder="Email"
          defaultValue={auth.user.email}
          ref={register({
            required: "Please enter your email",
          })}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-left text-red-600">
            {errors.email.message}
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

export default SettingsGeneral;
