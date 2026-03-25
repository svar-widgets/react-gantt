import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useWritableProp } from '@svar-ui/lib-react';
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
  } = props;

  const [value, setValue] = useWritableProp(props.value ?? 0);
  const [display, setDisplay] = useWritableProp(props.display ?? 'all');

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

  const [active, setActive] = useState(false);
  const [initialPosition, setInitialPosition] = useState(null);

  const startRef = useRef(0);
  const posRef = useRef();
  const displayRef = useRef(display);

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    if (initialPosition === null && value > 0) {
      setInitialPosition(value);
    }
  }, [initialPosition, value]);

  function getEventPos(ev) {
    return dir == 'x' ? ev.clientX : ev.clientY;
  }

  const move = useCallback(
    (ev) => {
      const newPos = posRef.current + getEventPos(ev) - startRef.current;

      setValue(newPos);
      let nextDisplay;

      if (newPos <= leftThreshold) {
        nextDisplay = 'chart';
      } else if (containerWidth - newPos <= rightThreshold) {
        nextDisplay = 'grid';
      } else {
        nextDisplay = 'all';
      }

      if (displayRef.current !== nextDisplay) {
        setDisplay(nextDisplay);
        displayRef.current = nextDisplay;
      }

      if (onMove) onMove(newPos);
    },
    [containerWidth, leftThreshold, rightThreshold, onMove],
  );

  const up = useCallback(() => {
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    setActive(false);
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', up);
  }, [move]);

  const cursor = useMemo(
    () => (display !== 'all' ? 'auto' : dir == 'x' ? 'ew-resize' : 'ns-resize'),
    [display, dir],
  );

  const down = useCallback(
    (ev) => {
      // Prevent dragging when in normal mode and only one view is visible
      if (!compactMode && (display === 'grid' || display === 'chart')) {
        return;
      }

      startRef.current = getEventPos(ev);

      posRef.current = value;
      setActive(true);

      document.body.style.cursor = cursor;
      document.body.style.userSelect = 'none';

      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    },
    [cursor, move, up, value, compactMode, display],
  );

  function resetToInitial() {
    setDisplay('all');
    if (initialPosition !== null) {
      setValue(initialPosition);
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

  const b = useMemo(() => getBox(value), [value, position, size, dir]);

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
