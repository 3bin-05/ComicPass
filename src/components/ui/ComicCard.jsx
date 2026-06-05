import React from "react";

export default function ComicCard({
  children,
  className = "",
  hoverable = true,
  title = "",
  variant = "card", // card, elevated
  ...props
}) {
  const getBackground = () => {
    if (variant === "elevated") return "bg-[var(--bg-elevated)]";
    return "bg-[var(--bg-card)]";
  };

  return (
    <div
      className={`relative comic-border comic-shadow flex flex-col p-6 rounded-none transition-all duration-150
        ${hoverable ? "comic-card-hover" : ""}
        ${getBackground()} ${className}`}
      {...props}
    >
      {/* Comic Panel Title Tag */}
      {title && (
        <div className="absolute -top-3.5 left-4 bg-[var(--text-primary)] text-[var(--bg-primary)] font-bangers px-3 py-1 border-3 border-[var(--border)] text-sm uppercase tracking-wider select-none transform -rotate-1 shadow-[2px_2px_0px_var(--shadow)] z-20">
          {title}
        </div>
      )}
      
      {children}
    </div>
  );
}
