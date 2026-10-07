import { useMemo, useState } from 'react';
import { getData } from '../data';
import {
  Gantt,
  ResourceLoad,
  Editor,
  ContextMenu,
  getDefaultColumns,
  getResourceColumns,
} from '../../src/';
import './ProScheduleResourceCalendars.css';

const taskCalendarOptions = [
  { id: 'default', label: 'Default' },
  { id: 'friday-off', label: 'Friday off' },
  { id: 'wednesday-off', label: 'Wednesday off' },
  { id: 'weekends-only', label: 'Weekends only' },
  { id: 'part-time', label: 'Part time' },
];

const fridayOffCalendar = {
  id: 'friday-off',
  css: 'friday-off',
  weekHours: {
    friday: 0,
  },
};

const calendarOptions = [
  { id: 'default', label: 'Default' },
  { id: 'wednesday-off-resource', label: 'Wednesday off' },
  { id: 'weekends-only-resource', label: 'Weekends only' },
  { id: 'part-time-resource', label: 'Part time' },
];

// only these two carry a calendar of their own, and it is the same one.
// 13 is assigned a weekday resource — nothing in common, so it is dimmed;
// 20 is assigned the weekend resource, so it schedules normally.
const weekendTasks = [13, 20];

const schedule = { resourceCalendars: true, auto: true };

const loadTemplate = (v) => `${v.hours}h, ${v.percent}%`;

function ProScheduleResourceCalendars({ skinSettings }) {
  const data = useMemo(() => getData('calendars'), []);

  const columns = useMemo(() => {
    const cols = getDefaultColumns({ resources: true });
    cols.splice(-1, 0, {
      id: 'calendar',
      header: 'Calendar',
      width: 140,
      editor: (task) => (task.type === 'summary' ? null : 'richselect'),
      options: taskCalendarOptions,
    });
    return cols;
  }, []);

  const resourceColumns = useMemo(() => {
    const cols = getResourceColumns();
    cols.splice(1, 0, {
      id: 'calendar',
      header: 'Calendar',
      width: 140,
      resize: true,
      template: (value) =>
        calendarOptions.find((option) => option.id === value)?.label ??
        'Default',
    });
    return cols;
  }, []);

  const resources = useMemo(
    () => data.resources.map((r) => ({ ...r })),
    [data],
  );

  const calendars = useMemo(
    () => [...data.calendars, fridayOffCalendar],
    [data],
  );

  const [tasks] = useState(() =>
    data.tasks.map((t) => {
      const copy = { ...t };
      delete copy.calendar;
      if (weekendTasks.includes(t.id)) copy.calendar = 'weekends-only';
      if (t.id === 10) {
        copy.start = new Date(2026, 3, 3);
        copy.end = new Date(2026, 3, 11);
      }
      if (t.id === 11) copy.start = new Date(2026, 3, 7);
      if (t.id === 12) copy.start = new Date(2026, 3, 7);
      if (t.id === 20) copy.start = new Date(2026, 3, 20);
      if (t.id === 21) copy.start = new Date(2026, 3, 23);
      if (t.id === 23) copy.start = new Date(2026, 3, 18);
      return copy;
    }),
  );

  const [api, setApi] = useState(null);

  return (
    <div className="demo wx-aadJT8YP">
      <div className="bar wx-aadJT8YP">
        <div className="labels wx-aadJT8YP">
          Wednesday off
          <div className="cell wednesday-off-resource wx-aadJT8YP"></div>
          Weekends only
          <div className="cell weekends-only-resource wx-aadJT8YP"></div>
          Part time
          <div className="cell part-time-resource wx-aadJT8YP"></div>
        </div>
      </div>

      <div className="main wx-aadJT8YP">
        <div className="gantt wx-aadJT8YP">
          <ContextMenu api={api}>
            <Gantt
              {...skinSettings}
              init={setApi}
              tasks={tasks}
              columns={columns}
              resources={resources}
              assignments={data.assignments}
              calendars={calendars}
              calendar="default"
              links={data.links}
              schedule={schedule}
              scales={data.scales}
              zoom
              splitTasks
            />
          </ContextMenu>
        </div>
        <div className="resource wx-aadJT8YP">
          {api && (
            <ResourceLoad
              api={api}
              columns={resourceColumns}
              template={loadTemplate}
            />
          )}
        </div>
        {api && <Editor api={api} />}
      </div>
    </div>
  );
}

export default ProScheduleResourceCalendars;
