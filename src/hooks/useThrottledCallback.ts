import { useCallback, useRef } from 'react';

/**
 * Creates a throttled version of the provided callback that will only execute
 * at most once every `delay` milliseconds.
 */
export function useThrottledCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastCallTime = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime.current;

      if (timeSinceLastCall >= delay) {
        // Execute immediately if enough time has passed
        lastCallTime.current = now;
        callback(...args);
      } else {
        // Schedule execution for later if still in throttle period
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = window.setTimeout(() => {
          lastCallTime.current = Date.now();
          callback(...args);
          timeoutRef.current = null;
        }, delay - timeSinceLastCall);
      }
    }) as T,
    [callback, delay]
  );
}