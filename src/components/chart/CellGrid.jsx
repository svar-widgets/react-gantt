import { useContext, useEffect, useRef, useState } from 'react';
import storeContext from '../../context';
import { grid } from '@svar-ui/gantt-store';
import { useStore } from '@svar-ui/lib-react';

function CellGrid() {
  const api = useContext(storeContext);
  const cellWidth = useStore(api, 'cellWidth');
  const cellHeight = useStore(api, 'cellHeight');
  const cellBorders = useStore(api, 'cellBorders');

  const nodeRef = useRef(null);
  const [color, setColor] = useState('#e4e4e4');

  useEffect(() => {
    if (typeof getComputedStyle !== 'undefined' && nodeRef.current) {
      const border = getComputedStyle(nodeRef.current).getPropertyValue(
        '--wx-gantt-border',
      );
      setColor(border ? border.substring(border.indexOf('#')) : '#1d1e261a');
    }
  }, []);

  const style = {
    width: '100%',
    height: '100%',
    background:
      cellWidth != null && cellHeight != null
        ? `url(${grid(cellWidth, cellHeight, color, cellBorders)})`
        : undefined,
    position: 'absolute',
  };

  return <div ref={nodeRef} style={style} />;
}

export default CellGrid;
