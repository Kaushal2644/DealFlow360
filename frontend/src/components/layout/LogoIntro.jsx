import { useEffect, useState } from "react";
import "./LogoIntro.css";

export default function LogoIntro({ onComplete }) {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExit(true), 3000);
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 3600);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`logo-intro ${exit ? "logo-intro--exit" : ""}`}>
      {/* Ambient lighting */}
      <div className="intro-glow intro-glow--blue" />
      <div className="intro-glow intro-glow--violet" />

      {/* Rotating orbital rings */}
      <div className="orbit orbit--outer">
        <span className="orbit-dot orbit-dot--blue" />
      </div>

      <div className="orbit orbit--inner">
        <span className="orbit-dot orbit-dot--orange" />
      </div>

      {/* Main logo */}
      <div className="logo-stage">
        <div className="logo-halo" />

        <img
          src="/logo.png"
          alt="DealFlow360"
          className="dealflow-logo"
        />

        {/* Light sweep */}
        <div className="logo-sweep" />
      </div>

      {/* Brand */}
      <div className="brand-content">
        <h1>
          DealFlow<span>360</span>
        </h1>

        <p>One flow. Every deal. 360° visibility.</p>

        <div className="loading-line">
          <div className="loading-progress" />
        </div>

        <small>Preparing your workspace</small>
      </div>
    </div>
  );
}