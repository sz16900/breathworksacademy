import React, { useState } from "react";
import Link from "next/link";
import ReauthModal from "components/ReauthModal";
import SettingsGeneral from "components/SettingsGeneral";
import SettingsPassword from "components/SettingsPassword";
import SettingsBilling from "components/SettingsBilling";
import { useAuth } from "util/auth";

function SettingsSection(props) {
  const auth = useAuth();
  const [formAlert, setFormAlert] = useState(null);

  // State to control whether we show a re-authentication flow
  // Required by some security sensitive actions, such as changing password.
  const [reauthState, setReauthState] = useState({
    show: false,
  });

  const validSections = {
    general: true,
    password: true,
    billing: true,
  };

  const section = validSections[props.section] ? props.section : "general";

  // Handle status of type "success", "error", or "requires-recent-login"
  // We don't treat "requires-recent-login" as an error as we handle it
  // gracefully by taking the user through a re-authentication flow.
  const handleStatus = ({ type, message, callback }) => {
    if (type === "requires-recent-login") {
      // First clear any existing message
      setFormAlert(null);
      // Then update state to show re-authentication modal
      setReauthState({
        show: true,
        // Failed action to try again after reauth
        callback: callback,
      });
    } else {
      // Display message to user (type is success or error)
      setFormAlert({
        type: type,
        message: message,
      });
    }
  };

  return (
    <section className="py-10 px-4">
      {reauthState.show && (
        <ReauthModal
          callback={reauthState.callback}
          provider={auth.user.providers[0]}
          onDone={() => setReauthState({ show: false })}
        />
      )}

      <div className="flex justify-center space-x-5">
        <Link href="/settings/general">
          <a className={"" + (section === "general" ? " underline" : "")}>
            General
          </a>
        </Link>
        <Link href="/settings/password">
          <a className={"" + (section === "password" ? " underline" : "")}>
            Password
          </a>
        </Link>
        <Link href="/settings/billing">
          <a className={"" + (section === "billing" ? " underline" : "")}>
            Billing
          </a>
        </Link>
      </div>
      <div className="container mx-auto mt-5 max-w-md">
        {formAlert && (
          <div
            className={
              "mb-4" +
              (formAlert.type === "error" ? " text-red-600" : "") +
              (formAlert.type === "success" ? " text-green-600" : "")
            }
          >
            {formAlert.message}
          </div>
        )}

        {section === "general" && <SettingsGeneral onStatus={handleStatus} />}

        {section === "password" && <SettingsPassword onStatus={handleStatus} />}

        {section === "billing" && <SettingsBilling onStatus={handleStatus} />}
      </div>
    </section>
  );
}

export default SettingsSection;
