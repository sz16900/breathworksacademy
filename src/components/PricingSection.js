import React from "react";
import Link from "next/link";
import { useAuth } from "util/auth";

function PricingSection(props) {
  const auth = useAuth();

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "10",
      perks: [
        "Lorem ipsum dolor sit amet",
        "Consectetur adipiscing elit",
        "Integer molestie lorem at massa",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: "20",
      perks: [
        "Lorem ipsum dolor sit amet",
        "Consectetur adipiscing elit",
        "Integer molestie lorem at massa",
        "Faucibus porta lacus fringilla vel",
        "Aenean sit amet erat nunc",
      ],
    },
    {
      id: "business",
      name: "Business",
      price: "50",
      perks: [
        "Lorem ipsum dolor sit amet",
        "Consectetur adipiscing elit",
        "Integer molestie lorem at massa",
        "Faucibus porta lacus fringilla vel",
        "Aenean sit amet erat nunc",
        "Lorem ipsum dolor sit amet",
        "Consectetur adipiscing elit",
      ],
    },
  ];

  return (
    <section className="py-12">
      <div className="container mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-medium text-center">
          Choose your plan
        </h1>
        <div className="flex flex-wrap">
          {plans.map((plan, index) => (
            <div className="p-4 w-full md:w-1/3" key={index}>
              <div className="flex flex-col p-5 h-full rounded border border-gray-300">
                <div className="text-xl">
                  {plan.name} (${plan.price}/mo)
                </div>

                {plan.perks && (
                  <ul className="mt-6 mb-6">
                    {plan.perks.map((perk, index) => (
                      <li className="mb-1" key={index}>
                        - {perk}
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href={
                    auth.user
                      ? `/purchase/${plan.id}`
                      : `/auth/signup?next=/purchase/${plan.id}`
                  }
                >
                  <a className="py-3 px-5 mt-auto w-full text-white bg-blue-500 rounded border-0 hover:bg-blue-600 focus:outline-none">
                    Choose
                  </a>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
