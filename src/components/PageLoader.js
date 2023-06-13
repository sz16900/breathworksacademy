import React from "react";

function PageLoader(props) {
  return (
    <div>
      {!props.children && <div className="p-10 text-center">Loading ...</div>}

      {props.children && <>{props.children}</>}
    </div>
  );
}

export default PageLoader;
