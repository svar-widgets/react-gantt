import { useState, useMemo } from 'react';
import { getData } from '../data';
import { Gantt, Editor, ContextMenu } from '../../src';

function SummariesProgress({ skinSettings }) {
  const data = useMemo(() => getData(), []);
  const { tasks, links, scales } = data;

  const [api, setApi] = useState();

  return (
    <>
      <ContextMenu api={api}>
          <Gantt
            {...skinSettings}
            init={setApi}
            tasks={tasks}
            links={links}
            scales={scales}
            cellWidth={30}
            summary={{ autoProgress: true }}
          />
      </ContextMenu>
      {api && <Editor api={api} />}
    </>
  );
}

export default SummariesProgress;
