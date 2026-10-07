import { useState, useMemo, useCallback, useContext, useRef } from 'react';
import { getData, resources, assignments } from '../data';
import { Gantt, Editor, ContextMenu, ResourceLoad } from '../../src';
import { DatePicker, Field, Checkbox, context } from '@svar-ui/react-core';
import { getDefaultColumns } from '@svar-ui/gantt-store';
import SchedulingFlagCell from '../custom/SchedulingFlagCell';
import './ProScheduleAll.css';

const linkRemovalReasons = {
  cycle: 'it would close a dependency loop',
  'parent-chain': 'a task cannot be linked to its own summary or subtask',
  'summary-endpoint':
    'a summary can only be linked from its end or to its start',
};

const inactiveColumn = {
  id: 'inactive',
  header: 'Inactive',
  width: 90,
  align: 'center',
  sort: true,
  cell: SchedulingFlagCell,
};

const slackColumns = [
  {
    id: 'text',
    header: 'Task name',
    flexgrow: 1,
  },
  {
    id: 'resources',
    header: 'Resources',
    width: 110,
    editor: 'multiselect',
  },
  {
    id: 'duration',
    header: 'Duration',
    align: 'center',
    width: 100,
  },
  {
    id: 'slack',
    header: 'Total slack',
    align: 'center',
    width: 110,
    getter: (t) => t.slack?.totalSlack,
    template: (v) => v || '-',
  },
  {
    id: 'add-task',
    header: 'Add task',
    width: 37,
    align: 'center',
  },
];

function ProScheduleAll({ skinSettings }) {
  const helpers = useContext(context.helpers);

  const data = useMemo(
    () =>
      getData('calendar', {
        splitTasks: true,
        unscheduledTasks: true,
        constraints: true,
        linkTypes: true,
      }),
    [],
  );

  const [api, setApi] = useState();
  const [tasks, setTasks] = useState(
    data.tasks.map((t) => {
      const copy = { ...t };
      delete copy.calendar;
      return copy;
    }),
  );

  const calendar = true;
  const [taskCalendars, setTaskCalendars] = useState(false);
  const [calendarsList, setCalendarsList] = useState([]);
  const [projectStart, setProjectStart] = useState(new Date(2026, 3, 2));
  const [projectEnd, setProjectEnd] = useState(new Date(2026, 4, 20));

  const [autoSchedule, setAutoSchedule] = useState(true);
  const [criticalPath, setCriticalPath] = useState({ type: 'flexible' });
  const [baselines, setBaselines] = useState(true);
  const [unscheduledTasks, setUnscheduledTasks] = useState(true);
  const [inactiveTasks, setInactiveTasks] = useState(true);
  const [splitTasks, setSplitTasks] = useState(true);
  const [slack, setSlack] = useState(false);
  const [resourceLoad, setResourceLoad] = useState(false);

  const [cellHeight, setCellHeight] = useState(44);

  const columns = useMemo(() => {
    const cols = slack
      ? [...slackColumns]
      : getDefaultColumns({ resources: true }).map((c) =>
          c.id === 'resources' ? { ...c, editor: 'multiselect' } : c,
        );
    const i = cols.findIndex((c) => c.id === 'add-task');
    if (inactiveTasks) cols.splice(i, 0, inactiveColumn);

    return cols;
  }, [slack, inactiveTasks]);

  const schedule = useMemo(() => ({ auto: autoSchedule }), [autoSchedule]);

  const markers = useMemo(
    () =>
      projectStart
        ? [
            {
              text: 'Start',
              start: projectStart,
            },
          ]
        : [],
    [projectStart],
  );

  function onCriticalPathChange() {
    setCriticalPath(
      criticalPath?.type === 'flexible' ? null : { type: 'flexible' },
    );
  }

  function onBaselinesChange(ev) {
    setBaselines(ev.value);
    setCellHeight(ev.value ? 44 : 38);
  }

  function onTaskCalendarsChange(ev) {
    const value = ev.value;
    setTaskCalendars(value);
    setCalendarsList(value ? data.calendars : []);
    setTasks(
      (api ? api.serialize() : tasks).map((t) => {
        if (!value) {
          const copy = { ...t };
          delete copy.calendar;
          return copy;
        }
        if (t.id === 10 || t.id === 23)
          return { ...t, calendar: 'wednesday-off' };
        return t;
      }),
    );
  }

  // gantt expects every task to have a start when unscheduled tasks are off
  const originalStarts = useMemo(
    () => new Map(getData('calendar').tasks.map((t) => [t.id, t.start])),
    [],
  );

  const unscheduledIds = useRef(new Set());

  function onUnscheduledChange(ev) {
    setUnscheduledTasks(ev.value);
    if (ev.value) {
      setTasks(
        api.serialize().map((t) => {
          if (!unscheduledIds.current.has(t.id)) return t;
          const copy = { ...t };
          delete copy.start;
          return copy;
        }),
      );
      unscheduledIds.current = new Set();
      return;
    }
    setTasks(
      api.serialize().map((t) => {
        if (t.start || t.type === 'summary') return t;
        unscheduledIds.current.add(t.id);
        const copy = {
          ...t,
          start: originalStarts.get(t.id) || projectStart,
        };
        delete copy.unscheduled;
        delete copy.end;
        return copy;
      }),
    );
  }

  function onSplitChange() {
    setTasks(
      api.serialize().map((t) => {
        //recalculate duration
        if (t.segments) delete t.duration;
        return t;
      }),
    );
  }

  //calculate baselines after summary dates are set
  const init = useCallback(
    (ganttApi) => {
      setApi(ganttApi);
      ganttApi.on('delete-link', ({ reason }) => {
        if (reason)
          helpers.showNotice({
            text: `Link removed: ${linkRemovalReasons[reason]}`,
          });
      });

      setTasks(
        ganttApi.serialize().map((t) => {
          return {
            ...t,
            base_start: t.start,
            base_end: t.end,
            base_duration: t.segments ? 0 : t.duration,
          };
        }),
      );
    },
    [helpers],
  );

  /*data.links.push({
		source: 2,
		target: 3,
		type: "e2s",
		id: 100,
	});
	data.links.push({
		source: 30,
		target: 4,
		type: "e2s",
		id: 101,
	});*/

  return (
    <div className="demo wx-D71fWZ7y">
      <div className="bar wx-D71fWZ7y">
        <Field label="Project start" position="left" width="220px">
          <DatePicker
            value={projectStart}
            onChange={({ value }) => setProjectStart(value)}
          />
        </Field>
        <Field label="Project end" position="left" width="220px">
          <DatePicker
            value={projectEnd}
            onChange={({ value }) => setProjectEnd(value)}
          />
        </Field>
        <Checkbox
          value={autoSchedule}
          label="Auto scheduling"
          onChange={({ value }) => setAutoSchedule(value)}
        />
        <Checkbox
          value={!!criticalPath}
          label="Critical path"
          onChange={onCriticalPathChange}
        />
        <Checkbox
          value={slack}
          label="Slack"
          onChange={({ value }) => setSlack(value)}
        />
        <Checkbox
          value={baselines}
          label="Baselines"
          onChange={onBaselinesChange}
        />
        <Checkbox
          value={unscheduledTasks}
          label="Unscheduled tasks"
          onChange={onUnscheduledChange}
        />
        <Checkbox
          value={inactiveTasks}
          label="Inactive tasks"
          onChange={({ value }) => setInactiveTasks(value)}
        />
        <Checkbox
          value={splitTasks}
          label="Split tasks"
          onChange={(ev) => {
            setSplitTasks(ev.value);
            onSplitChange();
          }}
        />
        <Checkbox
          value={taskCalendars}
          label="Task calendars"
          onChange={onTaskCalendarsChange}
        />
        <Checkbox
          value={resourceLoad}
          label="Resource load"
          onChange={({ value }) => setResourceLoad(value)}
        />
      </div>
      <div
        className={`main wx-D71fWZ7y${resourceLoad ? ' with-resources' : ''}`}
      >
        <div className="gantt wx-D71fWZ7y">
          {api && <Editor api={api} />}
          <ContextMenu api={api}>
            <Gantt
              init={init}
              {...skinSettings}
              cellWidth={50}
              cellHeight={cellHeight}
              gridWidth={660}
              tasks={tasks}
              links={data.links}
              scales={data.scales}
              calendar={calendar}
              calendars={calendarsList}
              resources={resources}
              assignments={assignments}
              schedule={schedule}
              criticalPath={criticalPath}
              projectStart={projectStart}
              projectEnd={projectEnd}
              markers={markers}
              baselines={baselines}
              unscheduledTasks={unscheduledTasks}
              inactiveTasks={inactiveTasks}
              splitTasks={splitTasks}
              slack={slack}
              columns={columns}
              undo={true}
            />
          </ContextMenu>
        </div>
        {resourceLoad && api ? (
          <div className="resource wx-D71fWZ7y">
            <ResourceLoad api={api} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ProScheduleAll;
