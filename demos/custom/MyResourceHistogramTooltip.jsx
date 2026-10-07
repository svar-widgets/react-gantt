import { useMemo } from 'react';
import { addDays, format, isSameDay } from 'date-fns';
import './MyResourceHistogramTooltip.css';

function MyResourceHistogramTooltip({ data }) {
  const histogram = data?.histogram;

  const percent = histogram?.capacity
    ? Math.round((histogram.hours / histogram.capacity) * 100)
    : 0;

  const range = useMemo(() => {
    if (!histogram?.start || !histogram?.end) return '';

    const start = histogram.start;
    const end = addDays(histogram.end, -1);
    const mask = 'MMM d, yyyy';

    return isSameDay(start, end)
      ? format(start, mask)
      : `${format(start, mask)} - ${format(end, mask)}`;
  }, [histogram]);

  if (!histogram) return null;

  return (
    <div className="data wx-aacqAtjt">
      <div className="text wx-aacqAtjt">
        <span className="caption wx-aacqAtjt">Name:</span>
        {histogram.resource?.name}
      </div>
      <div className="text wx-aacqAtjt">
        <span className="caption wx-aacqAtjt">Range:</span>
        {range}
      </div>
      <div className="text wx-aacqAtjt">
        <span className="caption wx-aacqAtjt">Load:</span>
        {histogram.hours}h
      </div>
      <div className="text wx-aacqAtjt">
        <span className="caption wx-aacqAtjt">Capacity:</span>
        {histogram.capacity}h
      </div>
      <div className="text wx-aacqAtjt">
        <span className="caption wx-aacqAtjt">Utilization:</span>
        {percent}%
      </div>
    </div>
  );
}

export default MyResourceHistogramTooltip;
