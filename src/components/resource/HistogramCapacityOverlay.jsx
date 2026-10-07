import { useMemo } from 'react';
import { getHistogramCapacityPath } from '@svar-ui/gantt-store';
import './HistogramCapacityOverlay.css';

function HistogramCapacityOverlay(props) {
  const {
    cellHeight = 1,
    viewportHeight = 0,
    viewportWidth = 0,
    rightInset = 0,
    bottomInset = 0,
    scrollLeft = 0,
    scrollTop = 0,
  } = props;

  const rows = useMemo(() => props.rows || [], [props.rows]);
  const columns = useMemo(() => props.columns || [], [props.columns]);

  const width = useMemo(
    () => columns.reduce((total, column) => total + column.width, 0),
    [columns],
  );

  const columnPositions = useMemo(() => {
    let left = 0;
    return columns.map((column) => {
      const position = { column, left, right: left + column.width };
      left = position.right;
      return position;
    });
  }, [columns]);

  const visibleColumns = useMemo(() => {
    const start = columnPositions.findIndex(
      (position) => position.right > scrollLeft,
    );
    if (start === -1) return [];

    const end = scrollLeft + viewportWidth;
    let index = start;
    while (index < columnPositions.length && columnPositions[index].left < end)
      index++;

    return columnPositions.slice(Math.max(0, start - 1), index);
  }, [columnPositions, scrollLeft, viewportWidth]);

  const visibleStart = Math.max(0, Math.floor(scrollTop / cellHeight) - 1);
  const visibleEnd = Math.min(
    rows.length,
    Math.ceil((scrollTop + viewportHeight) / cellHeight) + 1,
  );
  const visibleRows = useMemo(
    () => rows.slice(visibleStart, visibleEnd),
    [rows, visibleStart, visibleEnd],
  );

  return (
    <div
      className="wx-histogram-capacity-overlay wx-aabHBZEN"
      style={{ right: `${rightInset}px`, bottom: `${bottomInset}px` }}
      aria-hidden="true"
    >
      <svg
        className="wx-aabHBZEN"
        width={width}
        height={rows.length * cellHeight}
        style={{ transform: `translate(${-scrollLeft}px, ${-scrollTop}px)` }}
      >
        {visibleColumns.length
          ? visibleRows.map((row, index) => (
              <path
                key={row.id}
                className="wx-histogram-capacity-path wx-aabHBZEN"
                d={getHistogramCapacityPath(row, visibleColumns, cellHeight)}
                transform={`translate(0, ${(visibleStart + index) * cellHeight})`}
              />
            ))
          : null}
      </svg>
    </div>
  );
}

export default HistogramCapacityOverlay;
