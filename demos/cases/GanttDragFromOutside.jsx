import { useMemo, useRef, useState } from 'react';
import { locateID } from '@svar-ui/lib-dom';
import { Grid } from '@svar-ui/react-grid';
import { getData, backlogTasks } from '../data';
import { Gantt, Editor, locateTask } from '../../src';
import BacklogTaskCell from '../custom/BacklogTaskCell.jsx';
import './GanttDragFromOutside.css';

const MIME = 'application/x-svar-gantt-task';

function GanttDragFromOutside({ skinSettings }) {
  const data = useMemo(() => getData(), []);

  const [backlog, setBacklog] = useState(() => [...backlogTasks]);

  const backlogColumns = useMemo(
    () => [
      {
        id: 'text',
        header: 'Backlog',
        flexgrow: 1,
        cell: BacklogTaskCell,
      },
    ],
    [],
  );

  const gridSizes = useMemo(() => ({ headerHeight: 72, rowHeight: 38 }), []);

  const [api, setApi] = useState(null);
  const tableApiRef = useRef(null);
  const dropTargetRef = useRef(null);

  function clearDropTarget() {
    if (dropTargetRef.current) {
      dropTargetRef.current.classList.remove('task-drop');
      dropTargetRef.current = null;
    }
  }

  function isTaskDrag(e) {
    return Array.from(e.dataTransfer?.types || []).includes(MIME);
  }

  function onGridDragStart(e) {
    const tableApi = tableApiRef.current;
    const id = locateID(e);
    if (id == null || !tableApi) return;

    const row = tableApi.getRow(id);
    if (!row) return;

    e.dataTransfer.setData(MIME, JSON.stringify(row.id));
    e.dataTransfer.setData('text/plain', row.text || '');
    e.dataTransfer.effectAllowed = 'copy';
  }

  function onDragOver(e) {
    if (!isTaskDrag(e)) return;

    const taskTarget = locateTask(e, api);
    if (!taskTarget) {
      clearDropTarget();
      return;
    }

    const { node } = taskTarget;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    if (dropTargetRef.current !== node) {
      clearDropTarget();
      node.classList.add('task-drop');
      dropTargetRef.current = node;
    }
  }

  function onDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      clearDropTarget();
    }
  }

  function onDrop(e) {
    if (!isTaskDrag(e) || !api) return;

    const taskId = JSON.parse(e.dataTransfer.getData(MIME));
    const taskTarget = locateTask(e, api);
    clearDropTarget();

    if (taskId == null || !taskTarget) return;

    e.preventDefault();
    e.stopPropagation();

    const { id } = taskTarget;
    const item = backlog.find((task) => task.id === taskId);
    if (!item) return;

    const target = api.getTask(id);
    const mode = target.type === 'summary' ? 'child' : 'after';
    const summaryId =
      target.type === 'summary'
        ? target.id
        : api.getState().tasks.getSummaryId(target.id);
    const dateSource = summaryId ? api.getTask(summaryId) : target;

    const task = {
      text: item.text,
      type: item.type || 'task',
      duration: item.type === 'milestone' ? 0 : (item.duration ?? 1),
      start: dateSource.start,
    };

    api.exec('add-task', {
      task,
      target: id,
      mode,
    });
    setBacklog((prev) => prev.filter((t) => t.id !== taskId));
  }

  return (
    <div className="demo wx-aad8RgZ9">
      <div className="hint wx-aad8RgZ9">
        Drag a backlog task onto a task (grid row or chart) to add it. Start
        date comes from the parent summary, or the drop target.
      </div>
      <div className="body wx-aad8RgZ9">
        <div className="panel wx-aad8RgZ9" onDragStart={onGridDragStart}>
          <Grid
            ref={tableApiRef}
            data={backlog}
            columns={backlogColumns}
            draggableRows
            sizes={gridSizes}
          />
        </div>
        <div
          className="gantt wx-aad8RgZ9"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <Gantt
            {...skinSettings}
            init={setApi}
            tasks={data.tasks}
            links={data.links}
            scales={data.scales}
          />
        </div>
      </div>
      {api && <Editor api={api} />}
    </div>
  );
}

export default GanttDragFromOutside;
