import { useMemo } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import './DeadlineTaskContent.css';

function DeadlineTaskContent({ data }) {
  const overdueDays = useMemo(() => {
    const finish = data.end || data.start;
    return data.$overdue && finish && data.deadline
      ? differenceInCalendarDays(finish, data.deadline)
      : 0;
  }, [data]);

  function overdueLabel(float = false) {
    if (overdueDays <= 0) return null;
    return (
      <div className={`wx-overdue-label wx-aabryJde${float ? ' float' : ''}`}>
        <span className="wx-aabryJde">+{overdueDays}d</span>
      </div>
    );
  }

  return data.type !== 'milestone' ? (
    <>
      <div className="wx-content wx-aabryJde">{data.text || ''}</div>
      {overdueLabel(true)}
    </>
  ) : (
    <>
      <div className="wx-content wx-aabryJde"></div>
      <div className="wx-text-out wx-aabryJde">
        <div className="wx-aabryJde">{data.text || ''}</div>
        {overdueLabel()}
      </div>
    </>
  );
}

export default DeadlineTaskContent;
