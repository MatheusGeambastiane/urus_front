"use client";

import { type ReactElement, useEffect, useRef, useState } from "react";
import { ResponsiveContainer } from "recharts";

type ChartResponsiveContainerProps = {
  children: ReactElement;
};

export function ChartResponsiveContainer({ children }: ChartResponsiveContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasDimensions, setHasDimensions] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = (width: number, height: number) => {
      setHasDimensions(width > 0 && height > 0);
    };

    const { width, height } = container.getBoundingClientRect();
    updateDimensions(width, height);

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        updateDimensions(entry.contentRect.width, entry.contentRect.height);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-full min-h-0 w-full min-w-0">
      {hasDimensions ? (
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
