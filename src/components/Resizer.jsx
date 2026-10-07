import { useEffect, useRef } from 'react';
import './Resizer.css';

function Resizer(props) {
  const {
    side = 'left',
    layout = 'both',
    draggable = false,
    hideButtonsUntilHover = false,
    startButton = null,
    endButton = null,
    panelWidth = 0,
    // resizeInvert, onResize, onResizeEnd are read via propsRef in window handlers
    onResizeStart,
    onExpandStart,
    onExpandEnd,
  } = props;

  const cursor = draggable ? 'ew-resize' : 'auto';

  // latest props for the long-lived window listeners
  const propsRef = useRef(props);
  propsRef.current = props;

  const startRef = useRef(0);
  const posRef = useRef();
  const widthRef = useRef(null); // last dragged width, null when not dragging

  // stable handlers, created once so add/removeEventListener match
  const handlersRef = useRef(null);
  if (!handlersRef.current) {
    const h = {};
    h.widthAt = (ev) => {
      const delta = ev.clientX - startRef.current;
      return propsRef.current.resizeInvert
        ? posRef.current - delta
        : posRef.current + delta;
    };
    h.move = (ev) => {
      widthRef.current = h.widthAt(ev);
      propsRef.current.onResize?.(widthRef.current);
    };
    h.stop = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', h.move);
      window.removeEventListener('mouseup', h.up);
    };
    h.end = (endWidth) => {
      widthRef.current = null;
      h.stop();
      propsRef.current.onResizeEnd?.(endWidth);
    };
    h.up = (ev) => {
      h.end(h.widthAt(ev));
    };
    handlersRef.current = h;
  }

  function down(ev) {
    if (!draggable) return;
    const h = handlersRef.current;

    startRef.current = ev.clientX;
    posRef.current = widthRef.current = panelWidth;
    onResizeStart?.();

    document.body.style.cursor = cursor;
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', h.move);
    window.addEventListener('mouseup', h.up);
  }

  // unmounted mid-drag: still commit, so the store drops its drag snapshot
  useEffect(() => {
    const h = handlersRef.current;
    return () => {
      if (widthRef.current != null) h.end(widthRef.current);
      else h.stop();
    };
  }, []);

  const rootClassName = [
    'wx-pFykzMlT',
    'wx-resizer',
    `wx-resizer-${side}`,
    `wx-resizer-layout-${layout}`,
    hideButtonsUntilHover ? 'wx-resizer-grip-hover' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName} onMouseDown={down} style={{ cursor }}>
      <div className="wx-pFykzMlT wx-button-expand-box">
        {startButton?.visible ? (
          <div
            className={`wx-pFykzMlT wx-button-expand-content wx-button-expand-${startButton.side}`}
          >
            <i
              className={`wx-pFykzMlT wxi-menu-${startButton.icon}`}
              onClick={onExpandStart}
            ></i>
          </div>
        ) : null}
        {endButton?.visible ? (
          <div
            className={`wx-pFykzMlT wx-button-expand-content wx-button-expand-${endButton.side}`}
          >
            <i
              className={`wx-pFykzMlT wxi-menu-${endButton.icon}`}
              onClick={onExpandEnd}
            ></i>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Resizer;
