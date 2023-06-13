import React from "react";
import Meta from "components/Meta";
import NewsletterSection from "components/NewsletterSection";

function IndexPage(props) {
  return (
    <>
      <Meta />
      <section className="py-12 px-4">
        <div className="container mx-auto">
          This is a placeholder template, blah, blah.
        </div>
      </section>
      <NewsletterSection />
    </>
  );
}

export default IndexPage;
