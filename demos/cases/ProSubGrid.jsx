import { useMemo, useState } from 'react';
import { Gantt, HeaderMenu } from '../../src/';
import { getData } from '../data';

const statusOptions = ['Not started', 'In progress', 'Complete', 'On hold'];

function ProSubGrid({ skinSettings }) {
  const [api, setApi] = useState(null);

  const columns = useMemo(() => {
    const textfilter = { filter: { type: 'text', config: { clear: true } } };
    const datefilter = {
      filter: { type: 'datepicker', config: { format: '%d-%m-%Y' } },
    };
    const numberfilter = {
      filter: {
        type: 'text',
        config: {
          clear: true,
          handler: (value, filter) => {
            if (filter === '' || filter == null) return true;
            if (value == null || value === '') return false;
            const toNumber = (v) => Number(String(v).replace(/[^0-9.-]/g, ''));
            const cell = toNumber(value);
            const needle = toNumber(filter);
            return (
              !Number.isNaN(cell) && !Number.isNaN(needle) && cell === needle
            );
          },
        },
      },
    };
    const costfilter = {
      filter: {
        type: 'text',
        config: {
          clear: true,
          handler: (value, filter) => {
            const digits = (v) => String(v ?? '').replace(/[^0-9]/g, '');
            const needle = digits(filter);
            if (!needle) return true;
            return value != null && digits(value).includes(needle);
          },
        },
      },
    };
    const statusfilter = {
      filter: {
        type: 'richselect',
        config: { clear: true },
      },
    };

    return [
      {
        id: 'text',
        header: ['Task name', textfilter],
        flexgrow: 1,
      },
      {
        id: 'start',
        header: ['Start date', datefilter],
        align: 'center',
        width: 130,
      },
      {
        id: 'duration',
        header: ['Duration', numberfilter],
        width: 100,
        align: 'center',
      },
      {
        id: 'add-task',
        header: 'Add task',
        align: 'center',
      },
      {
        id: 'status',
        section: 'subGrid',
        header: ['Status', statusfilter],

        editor: 'combo',
        width: 130,
        options: statusOptions.map((label) => ({ id: label, label })),
      },
      {
        id: 'cost',
        section: 'subGrid',
        header: ['Cost', costfilter],
        width: 130,
        sort: true,
        editor: false,
        template: (v) => (v != null ? `$${Number(v).toLocaleString()}` : ''),
      },
    ];
  }, []);

  const data = useMemo(() => getData(), []);
  const tasks = useMemo(
    () =>
      data.tasks.map((task) => ({
        ...task,
        status:
          task.status ??
          (task.progress >= 100
            ? 'Complete'
            : task.progress > 0
              ? 'In progress'
              : 'Not started'),
        cost:
          task.cost ??
          (task.type === 'summary'
            ? null
            : task.type === 'milestone'
              ? 0
              : Math.round((task.duration || 1) * 750 + task.id * 100)),
      })),
    [data],
  );

  return (
    <HeaderMenu api={api}>
      <Gantt
        {...skinSettings}
        init={setApi}
        tasks={tasks}
        links={data.links}
        scales={data.scales}
        columns={columns}
        gridWidth={550}
      />
    </HeaderMenu>
  );
}

export default ProSubGrid;
