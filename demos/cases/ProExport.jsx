import { useMemo, useState } from 'react';
import { getData } from '../data';
import { Gantt, version } from '../../src/';
import { Toolbar, registerToolbarItem } from '@svar-ui/react-toolbar';
import { Switch, RichSelect, Segmented } from '@svar-ui/react-core';
import { Calendar } from '@svar-ui/gantt-store';
import './ProExport.css';

registerToolbarItem('switch', Switch);
registerToolbarItem('segmented', Segmented);
registerToolbarItem('richselect', RichSelect);

export default function ProExport({ skinSettings }) {

  const [size, setSize] = useState('auto');
  const [fit, setFit] = useState(true);
  const [api, setApi] = useState();
  const [config, setConfig] = useState('basic');

  const data = useMemo(() => {
    const advanced = config === 'advanced';
    return getData(null, {
      splitTasks: advanced,
      baselines: advanced,
      unscheduledTasks: advanced,
    });
  }, [config]);

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
        handler: () => {},
      },
      { text: 'Fit to page' },
      {
        id: 'fit',
        comp: 'switch',
        value: fit,
        handler: () => {},
      },
      {
        id: 'export-pdf',
        comp: 'button',
        text: 'To PDF',
        handler: () => exportOthers('pdf'),
      },
      {
        id: 'export-png',
        comp: 'button',
        text: 'To PNG',
        handler: () => exportOthers('png'),
      },
      { comp: 'separator' },
      {
        id: 'export-xlsx',
        comp: 'button',
        text: 'To XLSX',
        handler: () => exportExcel(false),
      },
      {
        id: 'export-xlsx-chart',
        comp: 'button',
        text: 'To XLSX with Chart',
        handler: () => exportExcel(true),
      },
      {
        id: 'export-mspx',
        comp: 'button',
        text: 'To MS Project (XML)',
        handler: () => exportOthers('mspx'),
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
        handler: () => {},
      },
    ];
  }, [size, fit, config, api]);

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

  const calendar = useMemo(() => new Calendar(), []);

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
            ]
          : null,
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

  function handleChange({ item, value }) {
    if (item.id === 'size') setSize(value);
    else if (item.id === 'fit') setFit(value);
    else if (item.id === 'config') setConfig(value);
  }

  return (
    <>
      <Toolbar items={items} onClick={handleClick} onChange={handleChange} />
      <div className="gtcell">
        {config === 'basic' ? (
          <Gantt
            init={setApi}
            {...skinSettings}
            tasks={data.tasks}
            links={data.links}
            scales={data.scales}
          />
        ) : (
          <Gantt
            init={setApi}
            baselines={true}
            splitTasks={true}
            unscheduledTasks={true}
            markers={markers}
            calendar={calendar}
            {...skinSettings}
            tasks={data.tasks}
            links={data.links}
            scales={data.scales}
          />
        )}
      </div>
    </>
  );
}
