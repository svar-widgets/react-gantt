import './TextCell.css';
import GroupCellText from './GroupCellText.jsx';

function TextCell({ row, column }) {
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
        ) : (
          row.text
        )}
      </div>
    </div>
  );
}

export default TextCell;
