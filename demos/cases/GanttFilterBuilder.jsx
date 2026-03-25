import { useState, useEffect, useMemo } from 'react';
import { getData } from '../data';
import { Gantt, ContextMenu } from '../../src/index.js';
import { FilterBuilder, getOptions, createFilter } from '@svar-ui/react-filter';
import './GanttFilterBuilder.css';

function GanttFilterBuilder({ skinSettings }) {
  const data = useMemo(() => getData(), []);
  const tasks = data.tasks;

  const [api, setApi] = useState(undefined);

  function init(ganttApi) {
    setApi(ganttApi);
  }

  const value = {
    glue: 'or',
    rules: [
      {
        field: 'text',
        filter: 'contains',
        value: 'plan',
      },
      {
        field: 'duration',
        filter: 'greater',
        value: 5,
      },
    ],
  };

  const options = useMemo(
    () => ({
      text: getOptions(tasks, 'text'),
      start: getOptions(tasks, 'start'),
      end: getOptions(tasks, 'end'),
      duration: getOptions(tasks, 'duration'),
    }),
    [tasks]
  );

  const fields = [
    { id: 'text', label: 'Task name', type: 'text' },
    { id: 'start', label: 'Start date', type: 'date' },
    { id: 'end', label: 'End date', type: 'date' },
    { id: 'duration', label: 'Duration', type: 'number' },
  ];

  function applyFilter({ value }) {
    const filter = createFilter(value);
    api.exec('filter-tasks', { filter });
  }

  useEffect(() => {
    if (api) applyFilter({ value });
  }, [api]);

  return (
    <div className="demo wx-aaduVfw8">
      <div className="bar wx-aaduVfw8">
        <FilterBuilder
          value={value}
          fields={fields}
          options={options}
          type={'line'}
          onChange={applyFilter}
        />
      </div>
      <div className="gtcell wx-aaduVfw8">
        <ContextMenu api={api}>
          <Gantt
            init={init}
            {...skinSettings}
            tasks={tasks}
            links={data.links}
            scales={data.scales}
          />
        </ContextMenu>
      </div>
    </div>
  );
}

export default GanttFilterBuilder;
