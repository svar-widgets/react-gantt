import { useCallback, useEffect, useRef, useState } from 'react';
import { clamp } from './clamp';

/**
 * RAF-based drag engine adapted from MAiQ SplitPanel's useDrag.
 * Works with pixel values to match react-gantt's API.
 *
 * Key improvement over the original setTimeout(100ms) approach:
 * - Uses requestAnimationFrame (~16ms) for ~6x smoother drag
 * - Uses pointer events (supports touch + mouse)
 * - Proper cleanup with cancelAnimationFrame
 */
export function useDragEngine({
  value,
  containerWidth,
  leftThreshold = 50,
  rightThreshold = 50,
  onMove,
  onDisplayChange,
}) {
  const engineRef = useRef({
    pos: value,
    drag: null,
    raf: 0,
  });

  const [active, setActive] = useState(false);

  // Keep engine pos in sync with external value when not dragging
  useEffect(() => {
    if (!engineRef.current.drag) {
      engineRef.current.pos = value;
    }
  }, [value]);

  // ── Display threshold check ─────────────────────────────────────────────
  const displayRef = useRef('all');

  const checkDisplay = useCallback(
    (pos) => {
      let nextDisplay;
      if (pos <= leftThreshold) {
        nextDisplay = 'chart';
      } else if (containerWidth - pos <= rightThreshold) {
        nextDisplay = 'grid';
      } else {
        nextDisplay = 'all';
      }
      if (displayRef.current !== nextDisplay) {
        displayRef.current = nextDisplay;
        onDisplayChange && onDisplayChange(nextDisplay);
      }
    },
    [containerWidth, leftThreshold, rightThreshold, onDisplayChange],
  );

  // ── Move handler (RAF-driven) ──────────────────────────────────────────
  const handleMove = useCallback(
    (e) => {
      const engine = engineRef.current;
      if (!engine.drag) return;

      if (engine.raf) cancelAnimationFrame(engine.raf);

      engine.raf = requestAnimationFrame(() => {
        const d = engine.drag;
        if (!d) return;

        const pos = e.clientX;
        const delta = pos - d.startPos;
        const newPos = clamp(
          d.startValue + delta,
          leftThreshold,
          containerWidth - rightThreshold,
        );

        // Skip tiny movements to avoid jitter
        if (Math.abs(newPos - engine.pos) < 0.5) return;

        engine.pos = newPos;

        // Fire onMove in RAF callback (~16ms vs old 100ms setTimeout)
        if (onMove) onMove(newPos);

        checkDisplay(newPos);
      });
    },
    [containerWidth, leftThreshold, rightThreshold, onMove, checkDisplay],
  );

  // ── Up handler ─────────────────────────────────────────────────────────
  const handleUp = useCallback(() => {
    const engine = engineRef.current;
    if (engine.raf) cancelAnimationFrame(engine.raf);
    engine.drag = null;

    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    setActive(false);

    // Final commit to ensure exact position
    if (onMove) onMove(engine.pos);
  }, [onMove]);

  // ── Event wiring (only active during drag) ─────────────────────────────
  useEffect(() => {
    if (!active) return;

    const move = (e) => handleMove(e);
    const up = () => handleUp();

    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);

    return () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
    };
  }, [active, handleMove, handleUp]);

  // ── Start handler ──────────────────────────────────────────────────────
  const onPointerDown = useCallback((e) => {
    engineRef.current.drag = {
      startPos: e.clientX,
      startValue: engineRef.current.pos,
    };

    setActive(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, []);

  return { active, onPointerDown };
}
