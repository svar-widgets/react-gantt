import { useMemo } from 'react';
import './ActionCell.css';

function ActionCell({ column, row, cell }) {
  const action = useMemo(() => column.id, [column?.id]);

  const icon = useMemo(() => {
    if (action.includes('edit')) return 'wxi-edit';
    if (action.includes('add')) return 'wxi-plus';
    if (action.includes('delete')) return 'wxi-delete';
    return '';
  }, [action]);

  const disabled = useMemo(() => {
    if (!action.includes('add')) return false;
    const gValue = row.$groupValue;
    return (
      (!row.$group && typeof gValue !== 'undefined') ||
      (row.$group && typeof gValue === 'undefined')
    );
  }, [action, row]);

  return cell || icon ? (
    <div style={{ textAlign: column.align }}>
      <i
        className={`wx-9DAESAHW wx-action-icon ${icon}${
          disabled ? ' wx-disabled' : ''
        }`}
        data-action={!disabled && action}
      ></i>
    </div>
  ) : null;
}

export default ActionCell;
