import { format } from 'date-fns';
import './MySegmentTooltip.css';

function MySegmentTooltip(props) {
  const { data, segmentIndex } = props;

  const mask = 'yyyy.MM.dd';
  const isSegment = data?.segments && typeof segmentIndex === 'number';
  const values = isSegment ? data.segments[segmentIndex] : data;

  return (
    <>
      {data ? (
        <div className="wx-SegTooltip data">
          <div className="wx-SegTooltip text">
            <span className="wx-SegTooltip caption">{data.type}:</span>
            {data.text}
          </div>
          {isSegment ? (
            <div className="wx-SegTooltip text">
              <span className="wx-SegTooltip caption">segment:</span>
              {values?.text || ''}
            </div>
          ) : null}
          <div className="wx-SegTooltip text">
            <span className="wx-SegTooltip caption">start:</span>
            {format(values.start, mask)}
          </div>
          {values.end ? (
            <div className="wx-SegTooltip text">
              <span className="wx-SegTooltip caption">end:</span>
              {format(values.end, mask)}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

export default MySegmentTooltip;
