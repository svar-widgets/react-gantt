import { Checkbox } from '@svar-ui/react-core';
import './SchedulingFlagCell.css';

export default function SchedulingFlagCell({ row, column, onAction }) {
  function handleChange({ value }) {
    onAction({
      action: 'update-cell',
      data: { id: row.id, column: column.id, value },
    });
  }

  return (
    <div className="wx-flag-cell wx-aabDZfHm">
      <Checkbox value={!!row[column.id]} onChange={handleChange} />
    </div>
  );
}
