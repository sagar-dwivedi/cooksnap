import { useEffect, useCallback, useRef } from "react";

type ObserverCallback = (entry: IntersectionObserverEntry) => void;

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  enabled?: boolean;
}

export function useIntersectionObserver(
  targetRef: React.RefObject<Element | null>,
  onIntersect: ObserverCallback,
  options: UseIntersectionObserverOptions = {}
) {
  const { enabled = true, ...observerOptions } = options;

  // Use refs to store the latest values without causing re-renders
  const callbackRef = useRef(onIntersect);
  const optionsRef = useRef(observerOptions);

  // Update refs when values change
  useEffect(() => {
    callbackRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    optionsRef.current = observerOptions;
  }, [observerOptions]);

  // Stable callback that uses the ref
  const stableCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callbackRef.current(entry);
      }
    });
  }, []);

  useEffect(() => {
    if (!enabled || !targetRef.current) return;

    const observer = new IntersectionObserver(stableCallback, {
      threshold: 0.1,
      rootMargin: "0px",
      ...optionsRef.current,
    });

    const element = targetRef.current;
    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [targetRef, stableCallback, enabled]);
}
