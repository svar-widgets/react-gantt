import { useMemo, useState } from 'react';
import { subDays } from 'date-fns';
import { getData, resources, assignments } from '../data';
import { Gantt, version } from '../../src/';
import { Toolbar, registerToolbarItem } from '@svar-ui/react-toolbar';
import { Switch, RichSelect, Segmented } from '@svar-ui/react-core';
import './ProExport.css';

registerToolbarItem('switch', Switch);
registerToolbarItem('segmented', Segmented);
registerToolbarItem('richselect', RichSelect);

export default function ProExport({ skinSettings }) {
  const [size, setSize] = useState('auto');
  const [fit, setFit] = useState(true);
  const [api, setApi] = useState();
  const [config, setConfig] = useState('basic');

  const data = useMemo(
    () =>
      getData(null, {
        splitTasks: true,
        baselines: true,
        constraints: true,
        deadlines: true,
      }),
    [],
  );
  const [tasks, setTasks] = useState(data.tasks);

  const items = useMemo(() => {
    return [
      { text: 'Page size' },
      {
        id: 'size',
        comp: 'richselect',
        css: 'rselect',
        value: size,
        options: [
          { id: 'auto', label: 'Auto' },
          { id: 'a4-landscape', label: 'A4 Landscape' },
          { id: 'a4', label: 'A4 Portrait' },
          { id: 'a3-landscape', label: 'A3 Landscape' },
          { id: 'a3', label: 'A3 Portrait' },
        ],
      },
      { text: 'Fit to page' },
      {
        id: 'fit',
        comp: 'switch',
        value: fit,
      },
      {
        id: 'export-pdf',
        comp: 'button',
        text: 'To PDF',
      },
      {
        id: 'export-png',
        comp: 'button',
        text: 'To PNG',
      },
      { comp: 'separator' },
      {
        id: 'export-xlsx',
        comp: 'button',
        text: 'To XLSX',
      },
      {
        id: 'export-xlsx-chart',
        comp: 'button',
        text: 'To XLSX with Chart',
      },
      {
        id: 'export-mspx',
        comp: 'button',
        text: 'To MS Project (XML)',
      },
      { comp: 'spacer' },
      {
        id: 'config',
        comp: 'segmented',
        value: config,
        options: [
          { id: 'basic', label: 'Basic' },
          { id: 'advanced', label: 'Advanced' },
        ],
      },
    ];
  }, [size, fit, config]);

  const markers = useMemo(
    () => [
      {
        start: new Date(2026, 3, 8),
        text: 'Approval of strategy',
        css: 'myMarker',
      },
    ],
    [],
  );

  const calendar = true;

  function handleClick({ item }) {
    const parts = item.id.split('-');
    if (parts[0] === 'export') {
      if (parts[1] === 'xlsx') {
        exportExcel(parts[2] === 'chart');
      } else {
        exportOthers(parts[1]);
      }
    }
  }

  const url = 'https://export.svar.dev/gantt/' + version;

  function exportExcel(visual) {
    api.exec('export-data', {
      url,
      format: 'xlsx',
      excel: {
        columns: visual
          ? [
              {
                id: 'text',
                header: 'Task name',
                width: 200,
              },
              {
                id: 'deadline',
                header: 'Deadline',
                width: 110,
                type: 'date',
              },
              {
                id: 'constraint_type',
                header: 'Constraint',
                width: 110,
                type: 'string',
              },
              {
                id: 'constraint_date',
                header: 'Constraint date',
                width: 130,
                type: 'date',
              },
            ]
          : [
              { id: 'id', header: 'ID', width: 60 },
              { id: 'text', header: 'Task name', width: 200 },
              {
                id: 'start',
                header: 'Start',
                width: 110,
                type: 'date',
              },
              {
                id: 'end',
                header: 'End',
                width: 110,
                type: 'date',
              },
              {
                id: 'duration',
                header: 'Duration',
                width: 80,
                type: 'number',
              },
              {
                id: 'deadline',
                header: 'Deadline',
                width: 110,
                type: 'date',
              },
              {
                id: 'constraint_type',
                header: 'Constraint',
                width: 110,
                type: 'string',
              },
              {
                id: 'constraint_date',
                header: 'Constraint date',
                width: 130,
                type: 'date',
              },
            ],
        sheetNames: ['Tasks', 'Links'],
        dateFormat: 'yyyy-mmm-dd',
        visual,
      },
    });
  }

  function exportOthers(format) {
    const parts = size.split('-');
    const props = {
      size: parts[0],
      landscape: parts[1] === 'landscape',
      fitSize: fit && size != 'auto',
      styles: '.wx-gantt .myMarker{ background-color: rgba(255, 84, 84, 0.77);',
    };
    api.exec('export-data', {
      url,
      format,
      pdf: props,
      png: props,
      ganttConfig: {
        cellWidth: 30,
      },
    });
  }

  function applyConfigTasks(config) {
    const serialized = api.serialize();
    return serialized.map((t) => {
      if (t.id !== 22) return t;
      if (config === 'advanced') {
        const copy = { ...t };
        delete copy.start;
        return copy;
      }
      if (!t.start && t.end && t.duration) {
        return {
          ...t,
          start: subDays(t.end, t.duration),
        };
      }
      return t;
    });
  }

  function handleChange({ item, value }) {
    if (item.id === 'size') setSize(value);
    else if (item.id === 'fit') setFit(value);
    else if (item.id === 'config') {
      setTasks(applyConfigTasks(value));
      setConfig(value);
    }
  }

  const schedule = useMemo(() => ({ auto: true }), []);

  return (
    <>
      <Toolbar items={items} onClick={handleClick} onChange={handleChange} />
      <div className="gtcell wx-Q1zY5wV3">
        {config === 'basic' ? (
          <Gantt
            init={setApi}
            {...skinSettings}
            tasks={tasks}
            links={data.links}
            scales={data.scales}
          />
        ) : (
          <Gantt
            init={setApi}
            baselines={true}
            splitTasks={true}
            unscheduledTasks={true}
            deadlines={true}
            schedule={schedule}
            markers={markers}
            calendar={calendar}
            {...skinSettings}
            tasks={tasks}
            links={data.links}
            scales={data.scales}
            resources={resources}
            assignments={assignments}
          />
        )}
      </div>
    </>
  );
}
