import React from "react";
import Meta from "components/Meta";
import ContactSection from "components/ContactSection";

function AboutPage(props) {
  return (
    <>
      <Meta title="About" description="Learn about our company and team" />
      <section className="py-12 px-4">
        <div className="container mx-auto">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorum
          consequatur numquam aliquam tenetur ad amet inventore hic beatae, quas
          accusantium perferendis sapiente explicabo, corporis totam!
        </div>
      </section>
      <ContactSection />
    </>
  );
}

export default AboutPage;
