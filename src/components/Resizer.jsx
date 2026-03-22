import { useState, useMemo, useEffect } from 'react';
import { useWritableProp } from '@svar-ui/lib-react';
import { useDragEngine } from './splitEngine/useDragEngine';
import './Resizer.css';

function Resizer(props) {
  const {
    position = 'after',
    size = 4,
    dir = 'x',
    onMove,
    onDisplayChange,
    compactMode,
    containerWidth = 0,
    leftThreshold = 50,
    rightThreshold = 50,
    containerRef,
  } = props;

  const [value] = useWritableProp(props.value ?? 0);
  const [display, setDisplay] = useWritableProp(props.display ?? 'all');

  const [initialPosition, setInitialPosition] = useState(null);
  const [fps, setFps] = useState(null);

  useEffect(() => {
    if (initialPosition === null && value > 0) {
      setInitialPosition(value);
    }
  }, [initialPosition, value]);

  // ── New RAF-based drag engine ────────────────────────────────────────
  const { active, onPointerDown } = useDragEngine({
    value,
    containerWidth,
    leftThreshold,
    rightThreshold,
    onMove,
    onDisplayChange: (nextDisplay) => {
      setDisplay(nextDisplay);
      onDisplayChange && onDisplayChange(nextDisplay);
    },
    onFps: import.meta.env.DEV ? setFps : undefined,
    containerRef,
  });

  // Guard: prevent drag when collapsed in non-compact mode
  const handlePointerDown = (e) => {
    if (!compactMode && (display === 'grid' || display === 'chart')) {
      return;
    }
    onPointerDown(e);
  };

  // ── Expand / Collapse button handlers (UNCHANGED) ────────────────────
  function resetToInitial() {
    setDisplay('all');
    if (initialPosition !== null) {
      if (onMove) onMove(initialPosition);
    }
  }

  function handleExpand(direction) {
    if (compactMode) {
      const newDisplay = display === 'chart' ? 'grid' : 'chart';
      setDisplay(newDisplay);
      onDisplayChange(newDisplay);
    } else {
      if (display === 'grid' || display === 'chart') {
        resetToInitial();
        onDisplayChange('all');
      } else {
        const newDisplay = direction === 'left' ? 'chart' : 'grid';
        setDisplay(newDisplay);
        onDisplayChange(newDisplay);
      }
    }
  }

  function handleExpandLeft() {
    handleExpand('left');
  }

  function handleExpandRight() {
    handleExpand('right');
  }

  // ── Sizing / cursor (UNCHANGED) ──────────────────────────────────────
  function getBox(val) {
    let offset = 0;
    if (position == 'center') offset = size / 2;
    else if (position == 'before') offset = size;

    const box = {
      size: [size + 'px', 'auto'],
      p: [val - offset + 'px', '0px'],
      p2: ['auto', '0px'],
    };

    if (dir != 'x') {
      for (let name in box) box[name] = box[name].reverse();
    }
    return box;
  }

  const cursor = useMemo(
    () => (display !== 'all' ? 'auto' : dir == 'x' ? 'ew-resize' : 'ns-resize'),
    [display, dir],
  );

  const b = useMemo(() => getBox(value), [value, position, size, dir]);

  // ── Render (UNCHANGED JSX structure) ────────────────────────────────
  const rootClassName = [
    'wx-resizer',
    `wx-resizer-${dir}`,
    `wx-resizer-display-${display}`,
    active ? 'wx-resizer-active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={'wx-pFykzMlT ' + rootClassName}
      onPointerDown={handlePointerDown}
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
      {import.meta.env.DEV && active && fps !== null && (
        <div style={{
          position: 'fixed',
          bottom: 8,
          right: 8,
          background: 'rgba(0,0,0,0.75)',
          color: '#0f0',
          fontSize: 11,
          fontFamily: 'monospace',
          padding: '2px 6px',
          borderRadius: 4,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 9999,
        }}>
          {fps} fps
        </div>
      )}
    </div>
  );
}

export default Resizer;
