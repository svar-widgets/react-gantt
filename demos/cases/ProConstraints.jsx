import { useMemo, useState } from 'react';
import { getData } from '../data';
import {
  Gantt,
  Editor,
  ContextMenu,
  Toolbar,
  Tooltip,
  ConflictReport,
} from '../../src/';
import ConstraintCell from '../custom/ConstraintCell.jsx';
import MyConstraintTooltipContent from '../custom/MyConstraintTooltipContent.jsx';
import './ProConstraints.css';

const calendar = {
  weekHours: {
    monday: 8,
    tuesday: 8,
    wednesday: 8,
    thursday: 8,
    friday: 8,
    saturday: 0,
    sunday: 0,
  },
};

const columns = [
  { id: 'text', header: 'Task name', flexgrow: 1 },
  { id: 'start', header: 'Start date', align: 'center', width: 100 },
  {
    id: 'constraint',
    header: 'Constraint',
    width: 160,
    cell: ConstraintCell,
  },
  { id: 'add-task', header: 'Add task', width: 37, align: 'center' },
];

function ProConstraints({ skinSettings }) {
  const [api, setApi] = useState(null);

  const data = useMemo(() => getData('day', { constraints: true }), []);
  const projectStart = useMemo(() => new Date(2026, 3, 2), []);

  return (
    <div className="demo wx-aadswCqt">
      <div className="toolbar-wrap wx-aadswCqt">
        <Toolbar api={api} />
      </div>
      <div className="gtcell wx-aadswCqt">
        <Tooltip api={api} content={MyConstraintTooltipContent}>
          <div className="gantt wx-aadswCqt">
            {api && <Editor api={api} autoSave={false} />}
            <ContextMenu api={api}>
              <Gantt
                {...skinSettings}
                init={setApi}
                tasks={data.tasks}
                links={data.links}
                scales={data.scales}
                columns={columns}
                calendar={calendar}
                cellHeight={40}
                gridWidth={480}
                schedule={{ auto: true }}
                projectStart={projectStart}
                undo
              />
            </ContextMenu>
          </div>
          <ConflictReport api={api} />
        </Tooltip>
      </div>
    </div>
  );
}

export default ProConstraints;
