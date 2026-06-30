import { useEffect } from "react";

export const PULL_THRESHOLD_PX = 80;

export type PullState = {
  startY: number | null;
  triggered: boolean;
};

export function detectPullTrigger(
  state: PullState,
  currentY: number,
  threshold: number = PULL_THRESHOLD_PX
): boolean {
  if (state.startY === null || state.triggered) return false;
  return currentY - state.startY > threshold;
}

export function usePullToRefreshConfirm(onTrigger: () => void) {
  useEffect(() => {
    const state: PullState = { startY: null, triggered: false };

    const handleTouchStart = (e: TouchEvent) => {
      const scroller = document.scrollingElement;
      if (!scroller || scroller.scrollTop > 0) {
        state.startY = null;
        return;
      }
      state.startY = e.touches[0].clientY;
      state.triggered = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (state.startY === null) return;
      const currentY = e.touches[0].clientY;
      // Pulling down from the top: suppress the browser's native
      // pull-to-refresh so our dialog wins the race. Requires a
      // non-passive listener — passive listeners cannot preventDefault.
      if (currentY > state.startY && e.cancelable) {
        e.preventDefault();
      }
      if (detectPullTrigger(state, currentY)) {
        state.triggered = true;
        onTrigger();
      }
    };

    const handleTouchEnd = () => {
      state.startY = null;
      state.triggered = false;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [onTrigger]);
}
