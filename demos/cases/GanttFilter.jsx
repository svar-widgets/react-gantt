import { useState, useMemo } from 'react';
import { getData } from '../data';
import { Gantt, ContextMenu } from '../../src/';
import { Switch, Field, Text, Button } from '@svar-ui/react-core';
import './GanttFilter.css';

function GanttFilter({ skinSettings }) {
  const data = useMemo(() => getData(), []);

  const [api, setApi] = useState(null);
  const [open, setOpen] = useState(true);
  const [text, setText] = useState('');
  const [tasks, setTasks] = useState([...data.tasks]);

  function init(ganttApi) {
    setApi(ganttApi);
  }

  function filterTasks({ value }) {
    setText(value);
    const lower = (value || '').toLowerCase();
    const filter = lower
      ? task => (task.text || '').toLowerCase().indexOf(lower) > -1
      : null;

    api.exec('filter-tasks', { filter, open });
  }

  function reload() {
    setTasks([...data.tasks]);
    setText('');
  }

  return (
    <div className="demo wx-aabXqObx">
      <div className="bar wx-aabXqObx">
        <Field label="Filter by Task name" className="field">
          <Text
            clear
            icon="wxi-search"
            value={text}
            onChange={filterTasks}
          />
        </Field>
        <Field label="Open tasks while filtering" className="field">
          <Switch
            value={open}
            onChange={({ value }) => setOpen(value)}
          />
        </Field>
        <div className="reload-btn wx-aabXqObx">
          <Button type="primary" onClick={reload}>Reload</Button>
        </div>
      </div>

      <div className="gtcell wx-aabXqObx">
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

export default GanttFilter;
