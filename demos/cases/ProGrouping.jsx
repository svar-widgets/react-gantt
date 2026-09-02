import { useState, useMemo } from 'react';
import { getData } from '../data';
import { Gantt, getDefaultColumns, Editor, ContextMenu } from '../../src/';
import { Field, RichSelect, Switch } from '@svar-ui/react-core';
import GroupTextCell from '../custom/GroupTextCell.jsx';
import './ProGrouping.css';

function ProGrouping({ skinSettings }) {
  const data = useMemo(() => getData(), []);

  const [api, setApi] = useState();
  const [field, setField] = useState('priority');
  const [taskHierarchy, setTaskHierarchy] = useState(false);
  const [ungroupedTop, setUngroupedTop] = useState(false);

  const groupBy = useMemo(() => {
    if (field === 'none') return null;
    return {
      field,
      taskHierarchy,
      ungrouped: ungroupedTop ? 'top' : 'bottom',
    };
  }, [field, taskHierarchy, ungroupedTop]);

  const columns = useMemo(() => {
    let cols = getDefaultColumns();

    // use custom cell for [GroupField: group value] template
    if (field) cols[0].cell = GroupTextCell;

    // delete columns that is used for grouping
    if (field) {
      const index = cols.findIndex(c => c.id === field);
      if (index >= 0) {
        cols.splice(index, 1);
      }
    }

    return cols;
  }, [field]);

  return (
    <div className="demo wx-R2uI6oP7">
      <div className="bar wx-R2uI6oP7">
        <div className="select wx-R2uI6oP7">
          <Field label="Group by" position="left">
            <RichSelect
              dropdown={{ css: 'select-dropdown' }}
              options={[
                { id: 'none', label: '- none -' },
                { id: 'duration', label: 'duration' },
                { id: 'priority', label: 'priority' },
                { id: 'progress', label: 'progress' },
              ]}
              value={field}
              onChange={({ value }) => setField(value)}
            />
          </Field>
        </div>
        <div className="switch wx-R2uI6oP7">
          <Field label="Task hierarchy" position="left">
            <Switch
              value={taskHierarchy}
              onChange={({ value }) => setTaskHierarchy(value)}
              disabled={field === 'none'}
            />
          </Field>
        </div>
        <div className="switch wx-R2uI6oP7">
          <Field
            label="Top position for ungrouped tasks"
            position="left"
            type="checkbox"
          >
            <Switch
              value={ungroupedTop}
              onChange={({ value }) => setUngroupedTop(value)}
              disabled={field === 'none'}
            />
          </Field>
        </div>
      </div>

      <div className="gtcell wx-R2uI6oP7">
        <ContextMenu api={api}>
          <Gantt
            init={setApi}
            {...skinSettings}
            tasks={data.tasks}
            links={data.links}
            scales={data.scales}
            columns={columns}
            groupBy={groupBy}
            undo
          />
        </ContextMenu>
        {api && <Editor api={api} />}
      </div>
      {api && <Editor api={api} />}
    </div>
  );
}

export default ProGrouping;
