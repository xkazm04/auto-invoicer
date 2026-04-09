"use client";

import { Children, type ReactNode } from "react";
import { FadeIn } from "./FadeIn";

interface StaggeredListProps {
  children: ReactNode;
  /** Delay between each child in ms */
  staggerMs?: number;
  /** Base delay before the first child starts */
  baseDelay?: number;
  /** Animation duration per child */
  duration?: number;
  /** CSS class applied to each FadeIn wrapper */
  itemClassName?: string;
}

export function StaggeredList({
  children,
  staggerMs = 60,
  baseDelay = 0,
  duration = 350,
  itemClassName = "",
}: StaggeredListProps) {
  return (
    <>
      {Children.map(children, (child, i) => {
        if (child == null) return null;
        return (
          <FadeIn
            key={i}
            delay={baseDelay + i * staggerMs}
            duration={duration}
            className={itemClassName}
          >
            {child}
          </FadeIn>
        );
      })}
    </>
  );
}
