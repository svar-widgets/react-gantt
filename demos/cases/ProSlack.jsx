import { useState } from 'react';
import { getData } from '../data';
import { Gantt, Editor } from '../../src/index.js';
import { format } from 'date-fns';
import './ProSlack.css';

function ProSlack({ skinSettings }) {
  const { tasks, links, scales } = getData('critical');

  const [api, setApi] = useState();

  const columns = [
    {
      id: 'text',
      header: 'Task name',
      flexgrow: 1,
    },
    {
      id: 'earliestStart',
      header: 'Earliest start',
      align: 'center',
      width: 120,
      getter: t => t.slack.earliestStart,
      template: v => (v ? format(v, 'dd-MM-yy') : '-'),
    },
    {
      id: 'latestStart',
      header: 'Latest start',
      align: 'center',
      width: 120,
      getter: t => t.slack.latestStart,
      template: v => (v ? format(v, 'dd-MM-yy') : '-'),
    },
    {
      id: 'freeSlack',
      header: 'Free slack',
      align: 'center',
      width: 100,
      getter: t => t.slack.freeSlack,
      template: v => (v ?? '-'),
    },
    {
      id: 'totalSlack',
      header: 'Total slack',
      align: 'center',
      width: 100,
      getter: t => t.slack.totalSlack,
    },
  ];

  return (
    <div className="demo wx-aadnPhUy">
      <Gantt
        {...skinSettings}
        init={setApi}
        tasks={tasks}
        links={links}
        scales={scales}
        columns={columns}
        gridWidth={590}
        slack
      />
      {api && <Editor api={api} />}
    </div>
  );
}

export default ProSlack;
