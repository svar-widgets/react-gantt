import { useMemo } from 'react';
import { getData } from '../data';
import { Gantt } from '../../src/';
import AvatarCell from '../custom/AvatarCell.jsx';
import NameAndDateCell from '../custom/NameAndDateCell.jsx';
import AddTaskCell from '../custom/AddTaskCell.jsx';

function GanttGrid({ skinSettings }) {
  const columns = useMemo(
    () => [
      { id: 'text', header: 'Task', flexgrow: 1, cell: NameAndDateCell },
      { id: 'assigned', header: 'Assigned', width: 160, cell: AvatarCell },
      {
        id: 'add-task',
        header: { cell: AddTaskCell },
        align: 'center',
        width: 80,
      },
    ],
    [],
  );

  const data = useMemo(() => getData(), []);

  return (
    <Gantt
      {...skinSettings}
      tasks={data.tasks}
      links={data.links}
      scales={data.scales}
      columns={columns}
      gridWidth={460}
      cellHeight={40}
    />
  );
}

export default GanttGrid;
