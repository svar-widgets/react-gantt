import { useState, useEffect, useCallback, useMemo } from 'react';
import { RestDataProvider } from '@svar-ui/gantt-data-provider';
import { Gantt, ContextMenu, Editor } from '../../src';

export default function GanttProvider() {
  const restProvider = useMemo(
    () => new RestDataProvider('https://gantt-backend.svar.dev'),
    [],
  );

  const [api, setApi] = useState();
  const [tasks, setTasks] = useState();
  const [links, setLinks] = useState();

  useEffect(() => {
    restProvider.getData().then(({ tasks: t, links: l }) => {
      setTasks(t);
      setLinks(l);
    });
  }, [restProvider]);

  const init = useCallback(
    (api) => {
      setApi(api);

      api.setNext(restProvider);

      api.on('request-data', (ev) => {
        restProvider.getData(ev.id).then(({ tasks, links }) => {
          api.exec('provide-data', {
            id: ev.id,
            data: {
              tasks,
              links,
            },
          });
        });
      });
    },
    [restProvider],
  );

  return (
    <>
      <ContextMenu api={api}>
        <Gantt init={init} tasks={tasks} links={links} />
      </ContextMenu>
      {api && <Editor api={api} />}
    </>
  );
}
