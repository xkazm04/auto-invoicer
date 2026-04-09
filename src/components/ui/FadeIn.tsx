"use client";

import { type ReactNode, type CSSProperties } from "react";

interface FadeInProps {
  children: ReactNode;
  /** Delay in ms before animation starts */
  delay?: number;
  /** Duration in ms */
  duration?: number;
  /** CSS class to apply to the wrapper */
  className?: string;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 400,
  className = "",
}: FadeInProps) {
  const style: CSSProperties = {
    animationName: "fadeInUp",
    animationDuration: `${duration}ms`,
    animationDelay: `${delay}ms`,
    animationFillMode: "both",
    animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  };

  return (
    <div className={className} style={style}>
      {children}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
