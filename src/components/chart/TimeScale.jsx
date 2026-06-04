import { useMemo } from 'react';
import { useStore } from '@svar-ui/lib-react';
import './TimeScale.css';

// Upper-row cells span multiple lowest-row cells. Walk widths so a span
// whose left edge has scrolled off is still rendered while its body is visible.
function mapRow(row, xFrom, xEnd) {
  const cells = row.cells;
  let from = 0;
  let start = cells.length;
  let acc = 0;
  for (let i = 0; i < cells.length; i++) {
    if (acc + cells[i].width > xFrom) {
      start = i;
      from = acc;
      break;
    }
    acc += cells[i].width;
  }
  let end = start;
  while (end < cells.length && acc < xEnd) {
    acc += cells[end].width;
    end++;
  }
  return { from, slice: cells.slice(start, end) };
}

function TimeScale(props) {
  const { api } = props;

  const scales = useStore(api, '_scales');
  const xArea = useStore(api, 'xArea');
  const highlightTime = useStore(api, 'highlightTime');

  const renderedRows = useMemo(() => {
    const rows = scales.rows;
    const lastIndex = rows.length - 1;

    return rows.map((row, ri) => {
      if (ri === lastIndex) {
        return {
          height: row.height,
          from: xArea.from,
          slice: row.cells.slice(xArea.start, xArea.end),
        };
      }
      return {
        height: row.height,
        ...mapRow(row, xArea.from, xArea.to),
      };
    });
  }, [scales, xArea]);

  return (
    <div className="wx-ZkvhDKir wx-scale" style={{ width: scales.width }}>
      {renderedRows.map((r, rowIdx) => (
        <div
          className="wx-ZkvhDKir wx-row"
          style={{ height: `${r.height}px`, paddingLeft: `${r.from}px` }}
          key={rowIdx}
        >
          {r.slice.map((cell, cellIdx) => {
            const extraClass = highlightTime
              ? highlightTime(cell.date, cell.unit)
              : '';
            const className =
              'wx-cell ' + (cell.css || '') + ' ' + (extraClass || '');
            return (
              <div
                className={'wx-ZkvhDKir ' + className}
                style={{ width: `${cell.width}px` }}
                key={cellIdx}
              >
                <span
                  className={
                    'wx-ZkvhDKir' + (cell.width > 100 ? ' wx-cell-value' : '')
                  }
                >
                  {cell.value}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default TimeScale;
