import { useState, useCallback } from 'react';
import { Gantt } from '../../src/';
import { ExcelImport } from '@svar-ui/react-excel-import';
import { Button } from '@svar-ui/react-core';
import './GanttExcelImport.css';

const taskFields = [
  {
    id: 'id',
    label: 'ID',
    keywords: ['id', 'identifier'],
  },
  {
    id: 'text',
    label: 'Task name',
    expectedType: 'text',
    keywords: ['name', 'title', 'task'],
  },
  {
    id: 'start',
    label: 'Start date',
    expectedType: 'date',
    required: true,
    keywords: ['start', 'from', 'begin'],
  },
  {
    id: 'end',
    label: 'End date',
    expectedType: 'date',
    keywords: ['end', 'finish', 'to'],
  },
  {
    id: 'duration',
    label: 'Duration',
    expectedType: 'number',
    keywords: ['duration', 'length', 'days'],
  },
  {
    id: 'progress',
    label: 'Progress',
    expectedType: 'number',
    keywords: ['progress', 'percent', 'complete'],
  },
  {
    id: 'type',
    label: 'Type',
    keywords: ['type', 'kind'],
  },
  {
    id: 'parent',
    label: 'Parent ID',
    keywords: ['parent', 'group'],
  },
];

function validateTasks(mappings) {
  const errors = [];
  if (!mappings.start) {
    errors.push({
      fieldId: 'start',
      code: 'required',
      message: 'Start date is required',
    });
  }
  if (mappings.type !== 'milestone' && !mappings.duration && !mappings.end) {
    errors.push({
      fieldId: 'duration',
      code: 'required',
      message: 'Map at least one of: Start date, End date, Duration',
    });
  }
  return { valid: errors.length === 0, errors, warnings: [] };
}

const linkFields = [
  {
    id: 'id',
    label: 'ID',
    keywords: ['id', 'identifier'],
  },
  {
    id: 'source',
    label: 'Source task ID',
    required: true,
    keywords: ['source', 'from', 'predecessor'],
  },
  {
    id: 'target',
    label: 'Target task ID',
    required: true,
    keywords: ['target', 'to', 'successor'],
  },
  {
    id: 'type',
    label: 'Type',
    expectedType: 'text',
    keywords: ['type', 'kind'],
  },
];

function validateLinks(mappings) {
  const errors = [];
  if (!mappings.source) {
    errors.push({
      fieldId: 'source',
      code: 'required',
      message: 'Source task ID is required',
    });
  }
  if (!mappings.target) {
    errors.push({
      fieldId: 'target',
      code: 'required',
      message: 'Target task ID is required',
    });
  }
  return { valid: errors.length === 0, errors, warnings: [] };
}

export default function GanttExcelImport({ skinSettings }) {
  const [activeWizard, setActiveWizard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [links, setLinks] = useState([]);
  const [status, setStatus] = useState(
    'No data loaded. Click a button to import tasks or links.',
  );

  const handleTasksImport = useCallback((rows, result) => {
    const imported = rows.map((row) => {
      const task = {
        id: row.id,
        text: row.text,
        type: row.type || 'task',
        progress: row.progress ?? 0,
        parent: row.parent || 0,
      };
      if (row.start instanceof Date) task.start = row.start;
      if (row.end instanceof Date) task.end = row.end;
      if (row.duration != null) task.duration = row.duration;
      if (task.type === 'summary') task.open = true;
      return task;
    });

    setTasks(imported);
    setStatus(
      `Imported ${result.imported} task(s), skipped ${result.skipped}.`,
    );
  }, []);

  const handleLinksImport = useCallback((rows, result) => {
    const imported = rows
      .filter((row) => row.source != null && row.target != null)
      .map((row) => ({
        id: row.id,
        source: row.source,
        target: row.target,
        type: row.type || 'e2s',
      }));

    setLinks(imported);
    setStatus(
      `Imported ${result.imported} link(s), skipped ${result.skipped}.`,
    );
  }, []);

  return (
    <div className="excel-import-demo">
      <div className="excel-import-toolbar">
        <Button type="primary" onClick={() => setActiveWizard('tasks')}>
          Import tasks
        </Button>
        <Button type="primary" onClick={() => setActiveWizard('links')}>
          Import links
        </Button>
        <span className="excel-import-status">{status}</span>
      </div>
      <div className="excel-import-gantt gtcell">
        <Gantt
          {...(skinSettings || {})}
          tasks={tasks}
          links={links}
        />
      </div>
      {activeWizard === 'tasks' && (
        <ExcelImport
          fields={taskFields}
          validate={validateTasks}
          onImport={handleTasksImport}
          onClose={() => setActiveWizard(null)}
          autoClose={true}
        />
      )}
      {activeWizard === 'links' && (
        <ExcelImport
          fields={linkFields}
          validate={validateLinks}
          onImport={handleLinksImport}
          onClose={() => setActiveWizard(null)}
          autoClose={true}
        />
      )}
    </div>
  );
}
