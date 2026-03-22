import { useCallback, useEffect, useRef, useState } from 'react';
import { clamp } from './clamp';

/**
 * RAF-based drag engine — V8/browser optimised.
 *
 * Optimisations applied:
 * 1. CSS variable bypass   — writes flex directly to the Grid DOM node during
 *                            drag; React only reconciles once on pointerup.
 * 2. Stable hidden class   — `drag` object is never null; V8 keeps one IC forever.
 * 3. setPointerCapture     — browser skips hit-testing on every pointermove.
 * 4. getCoalescedEvents()  — uses the last coalesced position so no sub-frame
 *                            input is silently discarded.
 * 5. Closure-free hot path — all values live in engineRef; handleMove has zero
 *                            deps and is never re-JIT'd by V8.
 */
export function useDragEngine({
  value,
  containerWidth,
  leftThreshold = 50,
  rightThreshold = 50,
  onMove,
  onDisplayChange,
  onFps,
  containerRef, // ref to .wx-layout DOM node for direct CSS writes
}) {
  // Optimization 2: always-allocated drag shape — V8 holds one hidden class
  const engineRef = useRef({
    pos: value,
    drag: { active: false, startPos: 0, startValue: 0 },
    raf: 0,
    lastFrameTime: 0,
    display: 'all',
    // Optimization 5: hot-path values stored here, not in closure deps
    containerWidth,
    leftThreshold,
    rightThreshold,
    onMove,
    onDisplayChange,
    onFps,
    containerRef,
  });

  // Sync hot-path values on every render without recreating closures
  const eng = engineRef.current;
  eng.containerWidth = containerWidth;
  eng.leftThreshold = leftThreshold;
  eng.rightThreshold = rightThreshold;
  eng.onMove = onMove;
  eng.onDisplayChange = onDisplayChange;
  eng.onFps = onFps;
  eng.containerRef = containerRef;

  const [active, setActive] = useState(false);

  // Keep engine pos in sync with external value when not dragging
  useEffect(() => {
    if (!engineRef.current.drag.active) {
      engineRef.current.pos = value;
    }
  }, [value]);

  // ── Move handler — stable closure, zero deps (optimization 5) ────────
  const handleMove = useCallback((e) => {
    const eng = engineRef.current;
    if (!eng.drag.active) return;

    if (eng.raf) cancelAnimationFrame(eng.raf);

    // Optimization 4: getCoalescedEvents — use latest sub-frame position
    const events = e.getCoalescedEvents?.() ?? [e];
    const clientX = events[events.length - 1].clientX;

    eng.raf = requestAnimationFrame((timestamp) => {
      const d = eng.drag;
      if (!d.active) return;

      if (eng.onFps && eng.lastFrameTime) {
        eng.onFps(Math.round(1000 / (timestamp - eng.lastFrameTime)));
      }
      eng.lastFrameTime = timestamp;

      const newPos = clamp(
        d.startValue + (clientX - d.startPos),
        eng.leftThreshold,
        eng.containerWidth - eng.rightThreshold,
      );

      if (Math.abs(newPos - eng.pos) < 0.5) return;
      eng.pos = newPos;

      // Optimization 1: direct DOM write — zero React involvement during drag
      const layoutEl = eng.containerRef?.current;
      if (layoutEl) {
        const gridEl = layoutEl.querySelector('.wx-table-container');
        if (gridEl) gridEl.style.flex = `0 0 ${newPos}px`;
      }

      // Display threshold check
      let nextDisplay;
      if (newPos <= eng.leftThreshold) nextDisplay = 'chart';
      else if (eng.containerWidth - newPos <= eng.rightThreshold)
        nextDisplay = 'grid';
      else nextDisplay = 'all';

      if (eng.display !== nextDisplay) {
        eng.display = nextDisplay;
        eng.onDisplayChange?.(nextDisplay);
      }
    });
  }, []); // stable for component lifetime — reads everything from engineRef

  // ── Up handler ───────────────────────────────────────────────────────
  const handleUp = useCallback(() => {
    const eng = engineRef.current;
    if (eng.raf) cancelAnimationFrame(eng.raf);
    eng.drag.active = false;
    eng.lastFrameTime = 0;

    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    setActive(false);

    // Clear inline CSS override — let React state take over
    const layoutEl = eng.containerRef?.current;
    if (layoutEl) {
      const gridEl = layoutEl.querySelector('.wx-table-container');
      if (gridEl) gridEl.style.flex = '';
    }

    // Optimization 1: one React commit on drop, not 60 per second
    eng.onMove?.(eng.pos);
  }, []);

  // ── Event wiring ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;

    document.addEventListener('pointermove', handleMove, { passive: true });
    document.addEventListener('pointerup', handleUp);
    document.addEventListener('pointercancel', handleUp);

    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
      document.removeEventListener('pointercancel', handleUp);
    };
  }, [active, handleMove, handleUp]);

  // ── Start handler ────────────────────────────────────────────────────
  const onPointerDown = useCallback((e) => {
    const eng = engineRef.current;
    eng.drag.active = true;
    eng.drag.startPos = e.clientX;
    eng.drag.startValue = eng.pos;
    eng.lastFrameTime = 0;

    // Optimization 3: setPointerCapture — browser skips hit-testing on every move
    e.currentTarget.setPointerCapture(e.pointerId);

    setActive(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, []);

  return { active, onPointerDown };
}
