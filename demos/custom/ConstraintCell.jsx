import { useContext, useMemo } from 'react';
import { setID } from '@svar-ui/lib-dom';
import { useStore } from '@svar-ui/lib-react';
import storeContext from '../../src/context.js';
import './ConstraintCell.css';

export default function ConstraintCell({ row, column }) {
  const api = useContext(storeContext);
  const conflicts = useStore(api, 'conflicts');

  const taskId = row.$id || row.id;
  const isViolated = useMemo(
    () => conflicts?.some((c) => c.type === 'constraint' && c.task === taskId),
    [conflicts, taskId],
  );

  const constraint = row.constraint ?? row[column.id];
  const text = constraint?.type ? constraint.type.toUpperCase() : '';

  if (!text) return null;

  return (
    <span
      className="wx-constraint-cell wx-aadN89t9"
      data-constraint-id={setID(row.id)}
    >
      {isViolated ? <i className="wxi-warning wx-aadN89t9"></i> : null}
      <span className="wx-label wx-aadN89t9">{text}</span>
    </span>
  );
}
