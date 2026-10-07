import { useMemo } from 'react';
import './BacklogTaskCell.css';

function BacklogTaskCell(props) {
  const { row } = props;

  const detail = useMemo(
    () =>
      row.type === 'milestone'
        ? 'milestone'
        : row.duration != null
          ? `${row.duration}d`
          : '',
    [row],
  );

  return (
    <div className="meta wx-aaaVCz2u">
      <span className="name wx-aaaVCz2u">{row.text}</span>
      {detail ? <span className="detail wx-aaaVCz2u">{detail}</span> : null}
    </div>
  );
}

export default BacklogTaskCell;
