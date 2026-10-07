import { useMemo, useRef, useState } from 'react';
import { locateID } from '@svar-ui/lib-dom';
import { Grid } from '@svar-ui/react-grid';
import { getData, resources, assignments } from '../data';
import { Gantt, Editor, locateTask } from '../../src/';
import ResourceNameCell from '../custom/ResourceNameCell.jsx';
import './ProResourceDragAssign.css';

const MIME = 'application/x-svar-gantt-resource';

const resourceColumns = [
  {
    id: 'name',
    header: 'Resources',
    flexgrow: 1,
    cell: ResourceNameCell,
  },
];

const gridSizes = { headerHeight: 72, rowHeight: 38 };

function isResourceDrag(e) {
  return Array.from(e.dataTransfer?.types || []).includes(MIME);
}

function ProResourceDragAssign({ skinSettings }) {
  const data = useMemo(() => getData(), []);
  const leafResources = useMemo(() => resources.filter((r) => r.parent), []);

  const [api, setApi] = useState(null);
  const tableApiRef = useRef(null);
  const dropTargetRef = useRef(null);

  function clearDropTarget() {
    if (dropTargetRef.current) {
      dropTargetRef.current.classList.remove('resource-drop');
      dropTargetRef.current = null;
    }
  }

  function onGridDragStart(e) {
    const tableApi = tableApiRef.current;
    const id = locateID(e);
    if (!id || !tableApi) return;

    const row = tableApi.getRow(id);
    if (!row) return;

    e.dataTransfer.setData(MIME, JSON.stringify(row.id));
    e.dataTransfer.setData('text/plain', row.name);
    e.dataTransfer.effectAllowed = 'copy';
  }

  function onDragOver(e) {
    if (!isResourceDrag(e)) return;

    const taskTarget = locateTask(e, api);
    if (!taskTarget || !api) {
      clearDropTarget();
      return;
    }

    const { id, node } = taskTarget;
    const task = api.getTask(id);
    if (!task || task.type === 'summary') {
      clearDropTarget();
      return;
    }

    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    if (dropTargetRef.current !== node) {
      clearDropTarget();
      node.classList.add('resource-drop');
      dropTargetRef.current = node;
    }
  }

  function onDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      clearDropTarget();
    }
  }

  function onDrop(e) {
    if (!isResourceDrag(e) || !api) return;

    const resourceId = JSON.parse(e.dataTransfer.getData(MIME));
    const taskTarget = locateTask(e, api);
    clearDropTarget();

    if (resourceId == null || !taskTarget) return;

    e.preventDefault();
    e.stopPropagation();

    const { id } = taskTarget;
    const task = api.getTask(id);
    const resource = api.getResource(resourceId);
    if (!task || task.type === 'summary' || !resource) return;

    api.exec('add-assignment', {
      assignment: {
        task: id,
        resource: resourceId,
      },
    });
  }

  return (
    <div className="demo wx-aaaoRKkI">
      <div className="hint wx-aaaoRKkI">
        Drag a resource onto a task (grid row or chart) to assign it. Summaries
        are not valid targets.
      </div>
      <div className="body wx-aaaoRKkI">
        <div className="panel wx-aaaoRKkI" onDragStart={onGridDragStart}>
          <Grid
            init={(tableApi) => (tableApiRef.current = tableApi)}
            data={leafResources}
            columns={resourceColumns}
            draggableRows
            sizes={gridSizes}
          />
        </div>
        <div
          className="gantt wx-aaaoRKkI"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <Gantt
            {...skinSettings}
            tasks={data.tasks}
            links={data.links}
            scales={data.scales}
            resources={resources}
            assignments={assignments}
            init={setApi}
          />
        </div>
      </div>
      {api && <Editor api={api} />}
    </div>
  );
}

export default ProResourceDragAssign;
