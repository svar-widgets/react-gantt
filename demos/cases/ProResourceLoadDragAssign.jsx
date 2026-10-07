import { useMemo, useRef, useState } from 'react';
import { locateID } from '@svar-ui/lib-dom';
import { getData, resources, assignments } from '../data';
import { Gantt, ResourceLoad, Tooltip, Editor, locateTask } from '../../src/';
import MyTaskResourceTooltip from '../custom/MyTaskResourceTooltip.jsx';
import './ProResourceLoadDragAssign.css';

const MIME = 'application/x-svar-gantt-resource';

function isResourceDrag(e) {
  return Array.from(e.dataTransfer?.types || []).includes(MIME);
}

function isDraggableRow(row) {
  return !row.data?.length;
}

function ProResourceLoadDragAssign({ skinSettings }) {
  const data = useMemo(() => getData(), []);

  const [api, setApi] = useState(null);
  const dropTargetRef = useRef(null);

  function clearDropTarget() {
    if (dropTargetRef.current) {
      dropTargetRef.current.classList.remove('resource-drop');
      dropTargetRef.current = null;
    }
  }

  function onResourceDragStart(e) {
    const id = locateID(e);
    if (!id || !api) return;

    const resource = api.getResource(id);
    if (!resource || resource.data?.length) return;

    e.dataTransfer.setData(MIME, JSON.stringify(resource.id));
    e.dataTransfer.setData('text/plain', resource.name);
    e.dataTransfer.effectAllowed = 'copy';

    const name = e.target.closest('.wx-row')?.querySelector('.wx-name');
    if (name) {
      e.dataTransfer.setDragImage(name, 0, name.offsetHeight / 2);
    }
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

    if (!resourceId || !taskTarget) return;

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
    <Tooltip api={api} content={MyTaskResourceTooltip}>
      <div className="layout wx-aabv1yV8">
        <div className="hint wx-aabv1yV8">
          Drag a resource from the load grid onto a task (grid row or chart) to
          assign it. Summaries are not valid targets.
        </div>
        <div className="main wx-aabv1yV8">
          <div
            className="gantt wx-aabv1yV8"
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
          <div
            className="resource wx-aabv1yV8"
            onDragStart={onResourceDragStart}
          >
            {api && <ResourceLoad api={api} draggableRows={isDraggableRow} />}
          </div>
        </div>
        {api && <Editor api={api} />}
      </div>
    </Tooltip>
  );
}

export default ProResourceLoadDragAssign;
