import { useEffect, useState } from "react";
import "./auth.css";

export default function AuthIntro({ onComplete }) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const closeTimer = setTimeout(() => {
      setClosing(true);
    }, 2800);

    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 3400);

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`auth-intro ${closing ? "auth-intro-exit" : ""}`}>
      <div className="intro-grid" />

      <div className="intro-light intro-light-one" />
      <div className="intro-light intro-light-two" />

      <div className="intro-orbit intro-orbit-one">
        <span />
      </div>

      <div className="intro-orbit intro-orbit-two">
        <span />
      </div>

      <div className="intro-logo-wrapper">
        <div className="intro-logo-glow" />

        <img
          src="/logo.png"
          alt="DealFlow360"
          className="intro-logo"
        />
      </div>

      <div className="intro-brand">
        <h1>
          DealFlow<span>360</span>
        </h1>

        <p>One flow. Every deal. 360° visibility.</p>

        <div className="intro-progress">
          <div className="intro-progress-bar" />
        </div>

        <span>Preparing your workspace</span>
      </div>
    </div>
  );
}