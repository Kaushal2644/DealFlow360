import { useState } from "react";
import AuthIntro from "./AuthIntro";
import "./auth.css";

export default function AuthLayout({ children }) {
  const [introFinished, setIntroFinished] = useState(false);

  return (
    <div className="auth-page">
      {!introFinished && (
        <AuthIntro
          onComplete={() => setIntroFinished(true)}
        />
      )}

      <div className="auth-content">
        {children}
      </div>
    </div>
  );
}