import { useEffect, useMemo, useState } from 'react';
import {
  Gantt,
  Editor,
  registerEditorItem,
  defaultTaskTypes,
  getEditorItems,
} from '../../src';
import { RadioButtonGroup } from '@svar-ui/react-core';
import UsersCustomCombo from '../custom/UsersCustomCombo.jsx';
import AvatarCell from '../custom/AvatarCell.jsx';
import { getData, users } from '../data';

export default function GanttEditorCustomControls({ skinSettings }) {
  useEffect(() => {
    registerEditorItem('radio', RadioButtonGroup);
    registerEditorItem('custom-combo', UsersCustomCombo);
  }, []);

  const items = useMemo(() => {
    const defaultEditorItems = getEditorItems();

    const items = defaultEditorItems.map((item) => ({ ...item }));
    items.splice(
      defaultEditorItems.findIndex((d) => d.key === 'type'),
      1,
      {
        key: 'type',
        comp: 'radio',
        label: 'Type',
        options: defaultTaskTypes.map((o) => ({
          ...o,
          value: o.id,
        })),
        config: {
          type: 'inline',
        },
      },
      {
        key: 'assigned',
        comp: 'custom-combo',
        label: 'Assigned',
        options: users,
      },
    );

    items.forEach((d) => {
      if (d.comp === 'date') {
        d.config = {
          time: true,
        };
      }
    });

    return items;
  }, []);

  const data = useMemo(() => getData(), []);
  const [api, setApi] = useState();

  const columns = useMemo(
    () => [
      { id: 'text', header: 'Task name', flexgrow: 1 },
      { id: 'assigned', header: 'Assigned', width: 160, cell: AvatarCell },
      { id: 'start', header: 'Start Date', width: 100 },
    ],
    [],
  );

  return (
    <>
      <Gantt
        init={setApi}
        {...skinSettings}
        tasks={data.tasks}
        links={data.links}
        scales={data.scales}
        lengthUnit="hour"
        columns={columns}
        gridWidth={480}
      />
      {api && <Editor api={api} items={items} />}
    </>
  );
}
