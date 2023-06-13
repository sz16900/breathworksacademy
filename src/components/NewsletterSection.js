import React, { useState } from "react";
import { useForm } from "react-hook-form";
import newsletter from "util/newsletter";

function NewsletterSection(props) {
  const [subscribed, setSubscribed] = useState(false);
  const { handleSubmit, register, errors } = useForm();

  const onSubmit = ({ email }) => {
    setSubscribed(true);
    // Parent component can optionally
    // find out when subscribed.
    props.onSubscribed && props.onSubscribed();
    // Subscribe them
    newsletter.subscribe({ email });
  };

  return (
    <section className="py-12 px-4 bg-gray-100">
      <div className="container mx-auto max-w-lg">
        <h1 className="mb-6 text-3xl font-medium text-center">
          Subscribe to our newsletter
        </h1>

        {subscribed === false && (
          <form onSubmit={handleSubmit(onSubmit)}>
            {errors.email && (
              <p className="text-sm text-left text-red-600 mb-1">
                {errors.email.message}
              </p>
            )}

            <div className="flex flex-col sm:flex-row">
              <input
                className="py-1 px-3 w-full leading-8 bg-white rounded border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 sm:mr-3"
                name="email"
                type="email"
                placeholder="Email"
                ref={register({
                  required: "Please enter an email address",
                })}
              />
              <button
                className="py-2 px-4 mt-3 text-white bg-blue-500 rounded border-0 sm:mt-0 hover:bg-blue-600 focus:outline-none"
                type="submit"
              >
                Subscribe
              </button>
            </div>
          </form>
        )}

        {subscribed === true && (
          <div className="text-center">You are now subscribed!</div>
        )}
      </div>
    </section>
  );
}

export default NewsletterSection;
