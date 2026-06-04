import { useMemo, useRef, useCallback } from 'react';
import { useStore } from '@svar-ui/lib-react';
import './Resizer.css';

function Resizer(props) {
  const {
    api,
    position = 'after',
    size = 4,
    dir = 'x',
    onMove,
    containerWidth = 0,
    rightThreshold = 50,
  } = props;

  const gridWidth = useStore(api, 'gridWidth');
  const displayMode = useStore(api, 'displayMode');
  const gridCollapseThreshold = useStore(api, '_gridCollapseThreshold');
  const compactMode = useStore(api, '_compactMode');

  function getBox(value) {
    let offset = 0;
    if (position === 'center') offset = size / 2;
    else if (position === 'before') offset = size;

    const box = {
      size: [size + 'px', 'auto'],
      p: [value - offset + 'px', '0px'],
      p2: ['auto', '0px'],
    };

    if (dir !== 'x') {
      for (let name in box) box[name] = box[name].reverse();
    }
    return box;
  }

  const startRef = useRef(0);
  const posRef = useRef();
  const timeoutRef = useRef();

  const gridWidthRef = useRef(gridWidth);
  gridWidthRef.current = gridWidth;
  const displayModeRef = useRef(displayMode);
  displayModeRef.current = displayMode;
  const compactModeRef = useRef(compactMode);
  compactModeRef.current = compactMode;
  const gridCollapseThresholdRef = useRef(gridCollapseThreshold);
  gridCollapseThresholdRef.current = gridCollapseThreshold;

  function getEventPos(ev) {
    return dir === 'x' ? ev.clientX : ev.clientY;
  }

  const cursor = useMemo(
    () =>
      displayMode !== 'all' ? 'auto' : dir === 'x' ? 'ew-resize' : 'ns-resize',
    [displayMode, dir],
  );

  const move = useCallback(
    (ev) => {
      const newPos = posRef.current + getEventPos(ev) - startRef.current;

      api.exec('resize-grid', {
        width: newPos,
      });
      let nextDisplay;

      if (newPos <= gridCollapseThresholdRef.current) {
        nextDisplay = 'chart';
      } else if (containerWidth - newPos <= rightThreshold) {
        nextDisplay = 'grid';
      } else {
        nextDisplay = 'all';
      }

      if (displayModeRef.current !== nextDisplay) {
        api.exec('set-display-mode', {
          mode: nextDisplay,
        });
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(
        () => onMove && onMove(newPos),
        100,
      );
    },
    [api, containerWidth, rightThreshold, onMove, dir],
  );

  const up = useCallback(() => {
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', up);
  }, [move]);

  const down = useCallback(
    (ev) => {
      // Prevent dragging when in normal mode and only one view is visible
      if (
        compactModeRef.current ||
        displayModeRef.current === 'grid' ||
        displayModeRef.current === 'chart'
      ) {
        return;
      }

      startRef.current = getEventPos(ev);
      posRef.current = gridWidthRef.current;

      document.body.style.cursor = cursor;
      document.body.style.userSelect = 'none';

      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    },
    [cursor, move, up, dir],
  );

  function handleExpand(direction) {
    let mode;
    if (compactMode) {
      mode = displayMode === 'chart' ? 'grid' : 'chart';
    } else {
      if (displayMode === 'grid' || displayMode === 'chart') {
        mode = 'all';
      } else mode = direction === 'left' ? 'chart' : 'grid';
    }

    api.exec('set-display-mode', { mode });
  }

  function handleExpandLeft() {
    handleExpand('left');
  }

  function handleExpandRight() {
    handleExpand('right');
  }

  const b = useMemo(
    () => getBox(gridWidth),
    [gridWidth, position, size, dir],
  );

  const rootClassName = [
    'wx-resizer',
    `wx-resizer-${dir}`,
    `wx-resizer-display-${displayMode}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={'wx-pFykzMlT ' + rootClassName}
      onMouseDown={down}
      style={{ width: b.size[0], height: b.size[1], cursor }}
    >
      <div className="wx-pFykzMlT wx-button-expand-box">
        <div className="wx-pFykzMlT wx-button-expand-content wx-button-expand-left">
          <i
            className="wx-pFykzMlT wxi-menu-left"
            onClick={handleExpandLeft}
          ></i>
        </div>
        <div className="wx-pFykzMlT wx-button-expand-content wx-button-expand-right">
          <i
            className="wx-pFykzMlT wxi-menu-right"
            onClick={handleExpandRight}
          ></i>
        </div>
      </div>
      <div className="wx-pFykzMlT wx-resizer-line"></div>
    </div>
  );
}

export default Resizer;
