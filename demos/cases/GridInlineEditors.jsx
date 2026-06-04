import { useMemo } from 'react';
import { getData } from '../data';
import { Gantt } from '../../src/';

function GridInlineEditors(props) {
  const { skinSettings } = props;

  const data = useMemo(() => getData(), []);

  const columns = useMemo(
    () => [
      {
        id: 'text',
        header: 'Task name',
        width: 170,
        sort: true,
        editor: 'text',
      },
      {
        id: 'start',
        header: 'Start date',
        width: 120,
        align: 'center',
        sort: true,
        editor: 'datepicker',
      },
      {
        id: 'duration',
        header: 'Duration',
        width: 80,
        sort: true,
        align: 'center',
        editor: 'text',
      },
      { id: 'add-task', header: 'Add task', width: 37, align: 'center' },
    ],
    [],
  );

  return (
    <Gantt
      {...skinSettings}
      tasks={data.tasks}
      links={data.links}
      scales={data.scales}
      columns={columns}
    />
  );
}

export default GridInlineEditors;
