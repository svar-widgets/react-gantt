import { useState, useMemo } from 'react';
import { getData, resources, assignments } from '../data';
import { Gantt, ContextMenu, getDefaultColumns, Editor } from '../../src/';
import { Field, Switch, Button, Dropdown } from '@svar-ui/react-core';
import './ProResources.css';

function ProResources({ skinSettings }) {
  const data = useMemo(() => getData(), []);

  const [api, setApi] = useState();
  const [tasks] = useState([...data.tasks]);

  const [enabled, setEnabled] = useState(false);
  const [multipleResources, setMultipleResources] = useState(false);
  const [resourceHierarchy, setResourceHierarchy] = useState(false);
  const [popup, setPopup] = useState(false);

  const groupBy = useMemo(
    () =>
      enabled
        ? {
            field: 'resource',
            multipleResources,
            resourceHierarchy,
          }
        : null,
    [enabled, multipleResources, resourceHierarchy]
  );

  const columns = useMemo(() => {
    let cols = getDefaultColumns({ resources: true });
    cols.find(c => c.id === 'resources').editor = 'multiselect';

    // drop the resources column when grouping by resource
    if (enabled) {
      const index = cols.findIndex(c => c.id === 'resources');
      if (index >= 0) cols.splice(index, 1);
    }

    return cols;
  }, [enabled]);

  function onMultipleResourcesChange(value) {
    setMultipleResources(value);
    if (value) setResourceHierarchy(false);
  }

  return (
    <ContextMenu api={api}>
      <div className="demo wx-B5pD9oI4">
        <div className="bar wx-B5pD9oI4">
          <div className="group-controls wx-B5pD9oI4">
            <div className="toggle wx-B5pD9oI4">
              <Field label="Group by resource" position="left">
                <Switch
                  value={enabled}
                  onChange={({ value }) => setEnabled(value)}
                />
              </Field>
            </div>
            <div className="settings-anchor wx-B5pD9oI4">
              <Button disabled={!enabled} onClick={() => setPopup(true)}>
                Settings
              </Button>
              {popup && (
                <Dropdown
                  width="auto"
                  onCancel={() => setPopup(false)}
                  css="my-dropdown"
                >
                  <div className="dropdown-wrapper wx-B5pD9oI4">
                    <div className="switch wx-B5pD9oI4">
                      <Field label="Multiple resources" position="left">
                        <Switch
                          onChange={({ value }) => onMultipleResourcesChange(value)}
                          value={multipleResources}
                        />
                      </Field>
                    </div>
                    <div className="switch wx-B5pD9oI4">
                      <Field label="Resource hierarchy" position="left">
                        <Switch
                          onChange={({ value }) => setResourceHierarchy(value)}
                          value={resourceHierarchy}
                          disabled={multipleResources}
                        />
                      </Field>
                    </div>
                  </div>
                </Dropdown>
              )}
            </div>
          </div>
        </div>

        <div className="gtcell wx-B5pD9oI4">
          <Gantt
            init={setApi}
            {...skinSettings}
            tasks={tasks}
            columns={columns}
            resources={resources}
            assignments={assignments}
            groupBy={groupBy}
            links={data.links}
            scales={data.scales}
            undo
          />
        </div>

        {api && <Editor api={api} />}
      </div>
    </ContextMenu>
  );
}

export default ProResources;
