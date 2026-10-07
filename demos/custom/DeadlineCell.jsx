import { useMemo } from 'react';
import { format, differenceInCalendarDays } from 'date-fns';
import './DeadlineCell.css';

function DeadlineCell({ row: task }) {
  const overdueDays = useMemo(() => {
    const finish = task.end || task.start;
    return task.$overdue && finish && task.deadline
      ? differenceInCalendarDays(finish, task.deadline)
      : 0;
  }, [task]);

  if (!task.deadline) return null;

  return (
    <>
      {format(task.deadline, 'dd-MM-yyyy')}
      {task.$overdue ? (
        <span className="overdue wx-aacDwrVM">+{overdueDays}d</span>
      ) : null}
    </>
  );
}

export default DeadlineCell;
