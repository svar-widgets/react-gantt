import { useMemo, useState } from 'react';
import { getData } from '../data';
import { Gantt, Editor, ContextMenu } from '../../src';
import './ProPlaceholderRow.css';

function ProPlaceholderRow({ skinSettings }) {
  const data = useMemo(() => getData('day'), []);

  const [api, setApi] = useState(null);

  // only columns with an editor of their own are editable on the placeholder
  const columns = useMemo(() => {
    const textFilter = { filter: { type: 'text', config: { clear: true } } };
    const dateFilter = {
      filter: { type: 'datepicker', config: { format: '%d-%m-%Y' } },
    };
    const numberFilter = {
      filter: {
        type: 'text',
        config: { clear: true, handler: (a, b) => !b || a === b * 1 },
      },
    };

    return [
      {
        id: 'text',
        header: ['Task name', textFilter],
        width: 220,
        sort: true,
        editor: 'text',
      },
      {
        id: 'start',
        header: ['Start date', dateFilter],
        width: 120,
        align: 'center',
        sort: true,
        editor: 'datepicker',
      },
      {
        id: 'end',
        header: ['End date', dateFilter],
        width: 120,
        align: 'center',
        sort: true,
        editor: 'datepicker',
      },
      {
        id: 'duration',
        header: ['Duration', numberFilter],
        width: 100,
        align: 'center',
        sort: true,
        editor: 'text',
      },
      { id: 'add-task', header: '', width: 37, align: 'center' },
    ];
  }, []);

  return (
    <div className="rows wx-aaeaN5bm">
      <div className="topbar wx-aaeaN5bm">
        <p className="wx-aaeaN5bm">
          Double-click a cell of the empty row at the bottom to name a new task,
          or click and drag on its timeline row to draw one.
        </p>
      </div>
      <div className="gtcell wx-aaeaN5bm">
        <ContextMenu api={api}>
          <Gantt
            {...skinSettings}
            init={setApi}
            tasks={data.tasks}
            links={data.links}
            scales={data.scales}
            gridWidth={600}
            placeholderRow
            columns={columns}
            undo
          />
        </ContextMenu>
        {api && <Editor api={api} />}
      </div>
    </div>
  );
}

export default ProPlaceholderRow;
