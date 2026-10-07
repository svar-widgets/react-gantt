import { useContext, useMemo } from 'react';
import { context } from '@svar-ui/react-core';
import './TextCell.css';
import GroupCellText from './GroupCellText.jsx';

function TextCell({ row, column }) {
  const i18n = useContext(context.i18n);
  const _ = useMemo(() => i18n.getGroup('gantt'), [i18n]);

  function getStyle(row, col) {
    return {
      justifyContent: col.align,
      paddingLeft: `${(row.$level - 1) * 20}px`,
    };
  }

  const CellComponent = column && column._cell;

  return (
    <div className="wx-pqc08MHU wx-content" style={getStyle(row, column)}>
      {!row.$empty && (row.data?.length || row.lazy) ? (
        <i
          className={`wx-pqc08MHU wx-toggle-icon wxi-menu-${row.open ? 'down' : 'right'}`}
          data-action="open-task"
        />
      ) : (
        <i className="wx-pqc08MHU wx-toggle-placeholder" />
      )}
      <div className="wx-pqc08MHU wx-text">
        {CellComponent ? (
          <CellComponent row={row} column={column} />
        ) : row.$group ? (
          <GroupCellText row={row} />
        ) : row.$placeholder && !row.text ? (
          <span className="wx-pqc08MHU wx-hint">{_('New task')}</span>
        ) : (
          row.text
        )}
      </div>
    </div>
  );
}

export default TextCell;
