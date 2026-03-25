import { useState, useMemo } from 'react';
import { getData } from '../data';
import { Gantt, ContextMenu as ContextMenuComponent, Editor } from '../../src/';

function ContextMenu(props) {
  const { skinSettings } = props;
  const [api, setApi] = useState(null);
  const data = useMemo(() => getData(), []);

  return (
    <>
      <ContextMenuComponent api={api}>
        <Gantt
          init={setApi}
          {...skinSettings}
          tasks={data.tasks}
          links={data.links}
          scales={data.scales}
          zoom
        />
      </ContextMenuComponent>
      {api && <Editor api={api} />}
    </>
  );
}

export default ContextMenu;
