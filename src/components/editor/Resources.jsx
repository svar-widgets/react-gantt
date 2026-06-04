import { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { Button } from '@svar-ui/react-core';
import { context } from '@svar-ui/react-core';
import { useStore } from '@svar-ui/lib-react';
import { tempID } from '@svar-ui/lib-state';

import GridSection from './GridSection.jsx';
import ActionCell from '../grid/ActionCell.jsx';
import ResourcesEditorCell from './ResourcesEditorCell.jsx';
import './Resources.css';

export default function Resources({
  api,
  autoSave,
  onExtChange: onChange,
  taskAssignments = null,
}) {
  const i18n = useContext(context.i18n);
  const _ = useMemo(() => i18n.getGroup('gantt'), [i18n]);

  const activeTask = useStore(api, 'activeTask');
  const resources = useStore(api, 'resources');
  const _assignments = useStore(api, '_assignments');
  const assignments = useStore(api, 'assignments');

  const [gridApi, setGridApi] = useState();
  const [newRowId, setNewRowId] = useState(null);
  const [taskResources, setTaskResources] = useState([]);

  useEffect(() => {
    setTaskResources(
      taskAssignments ||
        api.getTaskResources(activeTask).map((r) => {
          return { ...r, resource: r.id, id: r.assignmentId };
        }),
    );
  }, [api, activeTask, _assignments, taskAssignments]);

  const allOptions = useMemo(() => {
    const items = [];
    resources.eachChild((item) => {
      if (!item.data) items.push({ ...item, label: item.name });
    }, 0);
    return items;
  }, [resources]);

  const filteredOptions = useMemo(() => {
    return allOptions.filter(
      (r) => !taskResources.find((a) => a.resource === r.id),
    );
  }, [allOptions, taskResources]);

  function getActionData(evData) {
    return {
      view: 'resources',
      event: evData,
      values: {
        taskAssignments: taskResources,
      },
    };
  }

  function deleteAssignment(id) {
    gridApi.exec('close-editor', { ignore: true });
    if (autoSave) {
      api.exec('delete-assignment', { id });
    } else {
      setTaskResources((prev) => prev.filter((a) => a.id !== id));
      onChange &&
        onChange(
          getActionData({
            id,
            action: 'delete-assignment',
            data: { id },
          }),
        );
    }
    setNewRowId(null);
  }

  function addAssignment(id, assignment) {
    assignment = { ...assignment, units: 100, task: activeTask, id };
    const item = { assignment };
    if (autoSave) {
      api.exec('add-assignment', item);
    } else {
      const r = resources?.byId(assignment.resource);
      setTaskResources((prev) => [...prev, { ...r, ...assignment }]);
      onChange &&
        onChange(
          getActionData({
            id: r.id,
            action: 'add-assignment',
            data: item,
          }),
        );
    }
  }

  function getRowOptions(row) {
    if (row.id === newRowId) return filteredOptions;
    const rowOption = allOptions.find((op) => op.id === row.resource);
    return [rowOption].concat(filteredOptions);
  }

  function updateAssignment(id, assignment) {
    let item = assignments.byId(id);
    if (!item) item = taskResources.find((a) => a.id === id);
    const update = {
      id,
      assignment: { units: item.units || 100, ...assignment, id },
    };

    if (autoSave) {
      api.exec('update-assignment', update);
    } else {
      if (assignment.resource && assignment.resource !== item.resource) {
        const r = resources?.byId(assignment.resource);
        assignment = { ...r, ...update.assignment };
      }

      setTaskResources((prev) =>
        prev.map((row) => (row.id === id ? { ...row, ...assignment } : row)),
      );
      onChange &&
        onChange(
          getActionData({
            id,
            action: 'update-assignment',
            data: update,
          }),
        );
    }
  }

  const columns = useMemo(() => {
    filteredOptions;
    return [
      {
        id: 'resource',
        header: _('Resource'),
        cell: ResourcesEditorCell,
        type: 'string',
        flexgrow: 3,
        editor: (row) => {
          return {
            type: 'combo',
            config: {
              options: getRowOptions(row),
              cell: ResourcesEditorCell,
            },
          };
        },
        options: allOptions,
      },
      {
        id: 'units',
        header: _('Units'),
        flexgrow: 1,
        editor: {
          type: 'text',
          config: { type: 'number' },
        },
        template: (v) => `${v}%`,
      },
      {
        id: 'delete',
        header: '',
        cell: ActionCell,
        width: 50,
        align: 'center',
      },
    ];
  }, [filteredOptions, allOptions, _, newRowId]);

  function onAction(id, action) {
    if (id && action === 'delete') deleteAssignment(id);
  }

  function onEdit(id, column, value) {
    if (column === 'units') updateAssignment(id, { units: value * 1 });
    else if (column === 'resource') {
      const assignmentData = { resource: value };
      if (id === newRowId) {
        addAssignment(id, assignmentData);
      } else {
        updateAssignment(id, assignmentData);
      }
    }

    setNewRowId(null);
  }

  const newRowIdRef = useRef(newRowId);
  useEffect(() => {
    newRowIdRef.current = newRowId;
  }, [newRowId]);

  function onInit(tApi) {
    setGridApi(tApi);
    // delete a new empty row if an editor closed without resource selection
    tApi.on('close-editor', () => {
      if (newRowIdRef.current) {
        tApi.exec('delete-row', { id: newRowIdRef.current });
        setNewRowId(null);
      }
    });
  }

  const addingDisabled = useMemo(
    () => newRowId || !filteredOptions.length,
    [newRowId, filteredOptions],
  );

  const pendingRef = useRef(false);
  function onAddClick() {
    gridApi?.exec('close-editor', { ignore: true });
    if (!pendingRef.current) {
      pendingRef.current = true;
      const id = tempID();
      setNewRowId(id);
      requestAnimationFrame(() => {
        addRow(id);
        pendingRef.current = false;
      });
    }
  }

  function addRow(id) {
    gridApi.exec('add-row', { id, row: { units: 100 } });
    setTimeout(() => {
      gridApi.exec('open-editor', { id, column: 'resource' });
    });
  }

  return (
    <div className="wx-aabce6pu wx-section">
      {taskResources.length || newRowId ? (
        <GridSection
          onInit={onInit}
          columns={columns}
          onAction={onAction}
          onEdit={onEdit}
          data={taskResources}
          sizes={{
            rowHeight: 52,
          }}
        />
      ) : (
        <div className="wx-aabce6pu wx-nodata">{_('No assignments')}</div>
      )}
      <div className="wx-aabce6pu wx-button-wrapper">
        <Button
          disabled={addingDisabled}
          icon="wxi-plus"
          css="wx-button"
          onClick={onAddClick}
        >
          {_('Add resource')}
        </Button>
      </div>
    </div>
  );
}
