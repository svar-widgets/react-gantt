import { useMemo, useState } from 'react';
import { getData } from '../data';
import {
  Editor,
  Gantt,
  Tooltip,
  ContextMenu,
  getEditorItems,
} from '../../src/';
import { Checkbox, Combo } from '@svar-ui/react-core';
import MyTooltipContent from '../custom/MyTooltipContent.jsx';
import './ProSCurve.css';

const metrics = [
  { id: 'duration', label: 'By duration' },
  { id: 'progress', label: 'By progress' },
];

const caption = (type) => type[0].toUpperCase() + type.slice(1);

// No work happens on a weekend, so the curves flatten across one
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

// A summary takes its baseline from its children, so it keeps its own
function withBaseline(task) {
  if (!task.start || task.type === 'summary') return task;
  let base_start = new Date(
    new Date(task.start).setDate(task.start.getDate() - 2),
  );
  let base_duration = task.duration;
  while (base_start.getDay() === 0 || base_start.getDay() === 6) {
    base_start.setDate(base_start.getDate() - 1);
  }
  return { ...task, base_start, base_duration };
}

function ProSCurve({ skinSettings }) {
  const [api, setApi] = useState(null);
  const [config, setConfig] = useState({
    baseline: { on: true, metric: 'duration' },
    scheduled: { on: true, metric: 'duration' },
    earned: { on: true, metric: 'duration' },
  });

  const sCurve = useMemo(
    () =>
      Object.entries(config)
        .filter(([, line]) => line.on)
        .map(([type, line]) => ({ type, metric: line.metric })),
    [config],
  );

  function updateLine(type, key, value) {
    setConfig((prev) => ({
      ...prev,
      [type]: { ...prev[type], [key]: value },
    }));
  }

  const { tasks, links, scales } = useMemo(() => {
    const data = getData('calendar');
    // The plan the project was set against ran two days ahead of the schedule
    return { ...data, tasks: data.tasks.map(withBaseline) };
  }, []);

  // Add fields for editing baseline dates
  const items = useMemo(
    () =>
      getEditorItems().flatMap((item) =>
        item.key === 'links'
          ? [
              {
                key: 'base_start',
                comp: 'date',
                label: 'Baseline start',
                config: {
                  format: '%d-%m-%Y',
                },
              },
              {
                key: 'base_end',
                comp: 'date',
                label: 'Baseline end',
                config: {
                  format: '%d-%m-%Y',
                },
              },
              {
                key: 'base_duration',
                comp: 'counter',
                hidden: true,
              },
              item,
            ]
          : item,
      ),
    [],
  );

  return (
    <div className="rows wx-aaaKq6sp">
      <div className="row wx-aaaKq6sp">
        {Object.keys(config).map((type) => (
          <div className="line wx-aaaKq6sp" key={type}>
            <Checkbox
              label={caption(type)}
              value={config[type].on}
              onChange={({ value }) => updateLine(type, 'on', value)}
            />
            <div className="metric wx-aaaKq6sp">
              <Combo
                options={metrics}
                value={config[type].metric}
                onChange={({ value }) => updateLine(type, 'metric', value)}
                disabled={!config[type].on}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="gtcell wx-aaaKq6sp">
        <ContextMenu api={api}>
          <Tooltip api={api} content={MyTooltipContent}>
            <Gantt
              init={setApi}
              {...skinSettings}
              tasks={tasks}
              links={links}
              scales={scales}
              calendar={calendar}
              baselines
              cellWidth={40}
              cellHeight={45}
              sCurve={sCurve}
              zoom
            />
            {api && <Editor api={api} items={items} />}
          </Tooltip>
        </ContextMenu>
      </div>
    </div>
  );
}

export default ProSCurve;
