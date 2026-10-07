import { useMemo, useState } from 'react';
import { getData } from '../data';
import { Gantt, Editor, Tooltip, getDefaultColumns } from '../../src/';
import DeadlineTaskContent from '../custom/DeadlineTaskContent.jsx';
import MyTooltipContent from '../custom/MyTooltipContent.jsx';
import DeadlineCell from '../custom/DeadlineCell.jsx';

function ProDeadlines({ skinSettings }) {
  const data = useMemo(() => getData('day', { deadlines: true }), []);
  const [api, setApi] = useState(null);

  const columns = useMemo(() => {
    const cols = getDefaultColumns();
    cols.splice(2, 0, {
      id: 'deadline',
      header: 'Deadline',
      align: 'center',
      width: 110,
      cell: DeadlineCell,
    });
    return cols;
  }, []);

  return (
    <Tooltip api={api} content={MyTooltipContent}>
      <Gantt
        init={setApi}
        {...skinSettings}
        tasks={data.tasks}
        links={data.links}
        scales={data.scales}
        columns={columns}
        gridWidth={560}
        taskTemplate={DeadlineTaskContent}
        deadlines
      />
      {api && <Editor api={api} />}
    </Tooltip>
  );
}

export default ProDeadlines;
