import { useState, useEffect, useCallback } from 'react';
import { Gantt, ContextMenu, Editor } from '../../src';

const parseDates = (data) => {
  data.forEach((item) => {
    item.start = new Date(item.start);
    if (item.end) item.end = new Date(item.end);
  });
  return data;
};

export default function GanttBackend() {
  const server = 'https://gantt-backend.svar.dev';

  const [api, setApi] = useState();
  const [tasks, setTasks] = useState([]);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(server + '/tasks')
        .then((res) => res.json())
        .then((arr) => parseDates(arr)),
      fetch(server + '/links').then((res) => res.json()),
    ]).then(([t, l]) => {
      setTasks(t);
      setLinks(l);
    });
  }, []);

  const init = useCallback((api) => {
    setApi(api);

    api.on('request-data', (ev) => {
      Promise.all([
        fetch(server + `/tasks/${ev.id}`)
          .then((res) => res.json())
          .then((arr) => parseDates(arr)),
        fetch(server + `/links/${ev.id}`).then((res) => res.json()),
      ]).then(([tasks, links]) => {
        api.exec('provide-data', {
          id: ev.id,
          data: {
            tasks,
            links,
          },
        });
      });
    });
  }, []);

  return (
    <>
      <ContextMenu api={api}>
        <Gantt init={init} tasks={tasks} links={links} />
      </ContextMenu>
      {api && <Editor api={api} />}
    </>
  );
}
