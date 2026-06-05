import React from "react";

export default function SpeechBubble({
  children,
  className = "",
  tailPosition = "left", // 'left', 'right', 'none'
  ...props
}) {
  const getTailClass = () => {
    if (tailPosition === "left") return "speech-bubble-tail-left mb-4";
    if (tailPosition === "right") return "speech-bubble-tail-right mb-4";
    return "";
  };

  return (
    <div
      className={`relative bg-[var(--bg-card)] border-3 border-[var(--border)] px-5 py-4 rounded-[2rem] font-marker text-[var(--text-primary)] tracking-wide leading-relaxed shadow-[4px_4px_0px_var(--shadow)]
        ${getTailClass()} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
