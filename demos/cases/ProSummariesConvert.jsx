import { useMemo, useState } from 'react';
import { getData } from '../data';
import {
  Gantt,
  ContextMenu,
  Editor,
} from '../../src/';

export default function SummariesConvert({ skinSettings }) {
  const data = useMemo(() => getData(), []);
  const [api, setApi] = useState();

  return (
    <div className="wx-TEIogFEZ gt-cell">
      <ContextMenu api={api}>
        <Gantt
          init={setApi}
          {...skinSettings}
          tasks={data.tasks}
          links={data.links}
          scales={data.scales}
          summary={{ autoConvert: true }}
        />
      </ContextMenu>
      {api && <Editor api={api} />}
    </div>
  );
}
