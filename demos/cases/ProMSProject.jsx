import { getData, resources, assignments } from '../data';
import { Gantt } from '../../src';
import ConstraintCell from '../custom/ConstraintCell';
import { Toolbar, registerToolbarItem } from '@svar-ui/react-toolbar';
import UploadButton from '../custom/UploadButton';
import { useCallback, useMemo, useState } from 'react';

import './ProMSProject.css';

registerToolbarItem('upload', UploadButton);

const columns = [
  { id: 'text', header: 'Task name', flexgrow: 1 },
  { id: 'start', header: 'Start date', align: 'center', width: 100 },
  { id: 'resources', header: 'Resources', width: 110 },
  {
    id: 'constraint',
    header: 'Constraint',
    width: 160,
    cell: ConstraintCell,
  },
];

const schedule = { auto: true };
const projectStart = new Date(2026, 3, 2);

export default function ProMSProject({ skinSettings }) {
  const data = useMemo(() => getData('day', { constraints: true }), []);
  const [api, setApi] = useState();

  const handleClick = useCallback(
    ({ item }) => {
      if (item.id === 'export') {
        api.exec('export-data', { format: 'mspx' });
      }
    },
    [api],
  );

  const importMSProject = useCallback(() => {
    const file = document.getElementById('import-file').files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const xml = e.target.result;
      api.exec('import-data', {
        data: xml,
      });
    };
    reader.readAsText(file);
  }, [api]);

  const items = [
    {
      id: 'export',
      comp: 'button',
      text: 'Download MS Project XML',
    },
    {
      id: 'import',
      comp: 'upload',
      text: 'Upload MS Project XML',
      onChange: importMSProject,
    },
  ];

  return (
    <>
      <Toolbar items={items} onClick={handleClick} />
      <div className="gtcell wx-S4tH9lK0">
        <Gantt
          init={setApi}
          {...skinSettings}
          tasks={data.tasks}
          links={data.links}
          scales={data.scales}
          columns={columns}
          resources={resources}
          assignments={assignments}
          gridWidth={480}
          schedule={schedule}
          projectStart={projectStart}
        />
      </div>
    </>
  );
}
