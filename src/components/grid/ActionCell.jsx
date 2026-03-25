import { useMemo } from 'react';
import './ActionCell.css';

function ActionCell({ column, cell }) {
  const action = useMemo(() => column.id, [column?.id]);

  return cell || column.id === 'add-task' ? (
    <div style={{ textAlign: column.align }}>
      <i
        className="wx-9DAESAHW wx-action-icon wxi-plus"
        data-action={action}
      ></i>
    </div>
  ) : null;
}

export default ActionCell;
