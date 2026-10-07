import { useMemo, useState } from 'react';
import { getRollupsData } from '../data';
import { Gantt, Editor, ContextMenu } from '../../src/';
import { defaultColumns } from '@svar-ui/gantt-store';
import SchedulingFlagCell from '../custom/SchedulingFlagCell.jsx';
import './ProManualInactive.css';

const schedulingColumns = [
  {
    id: 'manual',
    header: 'Manual',
    width: 90,
    align: 'center',
    sort: true,
    cell: SchedulingFlagCell,
  },
  {
    id: 'inactive',
    header: 'Inactive',
    width: 90,
    align: 'center',
    sort: true,
    cell: SchedulingFlagCell,
  },
];

const columns = [...defaultColumns];
columns.splice(
  columns.findIndex((c) => c.id === 'add-task'),
  0,
  ...schedulingColumns,
);

function ProManualInactive({ skinSettings }) {
  const [api, setApi] = useState(null);

  const data = useMemo(() => getRollupsData(), []);

  return (
    <div className="gantt wx-aada0nc8">
      {api && <Editor api={api} />}
      <ContextMenu api={api}>
        <Gantt
          {...skinSettings}
          gridWidth={620}
          init={setApi}
          tasks={data.tasks}
          links={data.links}
          scales={data.scales}
          schedule={{ auto: true }}
          inactiveTasks
          columns={columns}
        />
      </ContextMenu>
    </div>
  );
}

export default ProManualInactive;
