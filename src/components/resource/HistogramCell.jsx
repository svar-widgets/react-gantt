import { useMemo } from 'react';
import { getHistogramBars } from '@svar-ui/gantt-store';
import './HistogramCell.css';

const MIN_LABEL_WIDTH = 36;

function getBarStyle(hours, ceiling) {
  const rawHeight = ceiling > 0 ? Math.min((hours / ceiling) * 100, 100) : 0;
  const height = Math.round(rawHeight * 100) / 100;
  if (hours > 0 && rawHeight > 0) {
    return { height: `max(${height}%, 3px)` };
  }
  return { height: `${height}%` };
}

function getLabel(bar) {
  return `${bar.hours}/${bar.capacity}`;
}

function showLabel(bar) {
  return bar.hours > 0 && bar.width >= MIN_LABEL_WIDTH;
}

function HistogramCell(props) {
  const { row, column } = props;

  const bars = useMemo(() => getHistogramBars(row, column), [row, column]);

  return (
    <div className="wx-histogram wx-aaevhuHz">
      {bars.map((bar) => (
        <div className="wx-histogram-bar wx-aaevhuHz" key={bar.key}>
          <div className="wx-histogram-stack wx-aaevhuHz">
            <div
              className={
                'wx-histogram-load wx-aaevhuHz' +
                (bar.overloaded ? ' wx-histogram-overload' : '')
              }
              style={getBarStyle(bar.hours, bar.ceiling)}
            ></div>
          </div>
          {showLabel(bar) ? (
            <div className="wx-histogram-label wx-aaevhuHz">
              <span className="wx-histogram-label-text wx-aaevhuHz">
                {getLabel(bar)}
              </span>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default HistogramCell;
