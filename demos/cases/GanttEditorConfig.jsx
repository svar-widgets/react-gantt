import { useState, useMemo } from 'react';
import { getData, resources, assignments } from '../data';
import {
  Gantt,
  Editor,
  ContextMenu,
  getEditorItems,
  getEditorButtons,
} from '../../src';
import { getDefaultColumns } from '../../src/index.js';
import './GanttEditorConfig.css';

function GanttEditorConfig({ skinSettings }) {
  const data = useMemo(() => getData(), []);

  const [api, setApi] = useState();

  const toolbarRows = useMemo(
    () =>
      getEditorButtons({
        autoSave: false,
        resources: true,
        splitTasks: true,
      }),
    [],
  );

  const [closeBtn, spacer, deleteBtn, saveBtn] = toolbarRows[0].items;
  const tabs = toolbarRows[1];

  const columns = useMemo(() => getDefaultColumns({ resources: true }), []);

  const topBar = useMemo(
    () => ({
      items: [tabs, spacer, deleteBtn, saveBtn, closeBtn],
    }),
    [tabs, spacer, deleteBtn, saveBtn, closeBtn],
  );

  const keys = useMemo(
    () => [
      'text',
      'type',
      'start',
      'end',
      'duration',
      'progress',
      'details',
      'links',
      'resources',
      'segments',
    ],
    [],
  );

  const defaultEditorItems = useMemo(
    () => getEditorItems({ resources: true, splitTasks: true }),
    [],
  );

  const items = useMemo(
    () =>
      keys.map((key) => ({
        ...defaultEditorItems.find((op) => op.key === key),
      })),
    [keys, defaultEditorItems],
  );

  return (
    <div className="rows wx-L7sT2vX4">
      <div className="bar wx-L7sT2vX4">
        Demo uses "resources" and "split tasks" <span className="pro wx-L7sT2vX4">PRO</span>{' '}
        features
      </div>
      <div className="gtcell wx-L7sT2vX4">
        <ContextMenu api={api}>
          <Gantt
            init={setApi}
            {...skinSettings}
            tasks={data.tasks}
            links={data.links}
            scales={data.scales}
            columns={columns}
            resources={resources}
            assignments={assignments}
            splitTasks
          />
        </ContextMenu>
        {api && (
          <Editor
            api={api}
            items={items}
            topBar={topBar}
            css="myeditor"
            placement="modal"
            autoSave={false}
          />
        )}
      </div>
    </div>
  );
}

export default GanttEditorConfig;
