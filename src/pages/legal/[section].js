import React from "react";
import { useRouter } from "next/router";
import Meta from "components/Meta";
import LegalSection from "components/LegalSection";

function LegalPage(props) {
  const router = useRouter();

  return (
    <>
      <Meta title="Legal" />
      <LegalSection section={router.query.section} key={router.query.section} />
    </>
  );
}

// Tell Next.js to export static files for each page
// See https://nextjs.org/docs/basic-features/data-fetching#getstaticpaths-static-generation
export const getStaticPaths = () => ({
  paths: [
    { params: { section: "terms-of-service" } },
    { params: { section: "privacy-policy" } },
  ],
  fallback: true,
});

export function getStaticProps({ params }) {
  return { props: {} };
}

export default LegalPage;
