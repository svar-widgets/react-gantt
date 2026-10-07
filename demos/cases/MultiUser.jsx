import { useCallback, useEffect, useMemo, useState } from 'react';
import { RemoteEvents, RestDataProvider } from '@svar-ui/gantt-data-provider';
import { Gantt, ContextMenu, Editor } from '../../src';
import { Checkbox, Button } from '@svar-ui/react-core';
import './MultiUser.css';

const server = 'https://gantt-backend.svar.dev';

const clients = ['Client A', 'Client B'];

function Client({ label, skinSettings, schedule }) {
  const [api, setApi] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [links, setLinks] = useState([]);
  const [connected, setConnected] = useState(false);

  const client = useMemo(() => {
    const restProvider = new RestDataProvider(server);

    let loadRetry = null;
    async function load() {
      clearTimeout(loadRetry);
      try {
        const response = await restProvider.getData();
        setTasks(response.tasks);
        setLinks(response.links);
      } catch (error) {
        console.error('could not load the project, retrying', error);
        loadRetry = setTimeout(load, 2000);
      }
    }

    const remoteEvents = new RemoteEvents(restProvider, {
      url: `${server}/events`,
      onResync: load,
      onConnectionChange: (online) => setConnected(online),
    });
    restProvider.setHeaders({ 'X-Client-Id': remoteEvents.clientId });

    return {
      restProvider,
      remoteEvents,
      load,
      stopLoad: () => clearTimeout(loadRetry),
    };
  }, []);

  const init = useCallback(
    (api) => {
      setApi(api);
      api.setNext(client.restProvider);

      api.on('request-data', (ev) => {
        client.restProvider
          .getData(ev.id)
          .then(({ tasks, links }) => {
            api.exec('provide-data', {
              id: ev.id,
              data: { tasks, links },
            });
          })
          .catch((error) => console.error('could not load the branch', error));
      });
    },
    [client],
  );

  // connect once the api is ready, disconnect on unmount
  useEffect(() => {
    if (!api) return;
    client.remoteEvents
      .connect(api)
      .catch(() => console.error('could not connect to remote events'))
      .then(client.load);

    return () => {
      client.stopLoad();
      client.remoteEvents.disconnect();
    };
  }, [api, client]);

  function toggleConnection() {
    if (connected) client.remoteEvents.disconnect();
    else client.remoteEvents.connect(api).catch(() => {});
  }

  return (
    <>
      <div className="row config wx-aabA5gZk">
        <div
          className="wx-aabA5gZk"
          style={{ color: 'var(--wx-color-font-alt)' }}
        >
          {label}
        </div>
        <span className="wx-aabA5gZk">&middot;</span>
        <div className="wx-aabA5gZk">
          <span className="wx-aabA5gZk">Status</span>:{' '}
          <span
            className={`status wx-aabA5gZk ${connected ? 'connected' : 'disconnected'}`}
          >
            {connected ? 'Connected' : 'Disconnected'}
          </span>{' '}
          (
          <Button onClick={toggleConnection} type="link">
            {connected ? 'Disconnect' : 'Connect'}
          </Button>
          )
        </div>
      </div>
      <div className="row gantt wx-aabA5gZk">
        <ContextMenu api={api}>
          <Gantt
            {...skinSettings}
            cellHeight={32}
            cellWidth={60}
            init={init}
            tasks={tasks}
            links={links}
            schedule={schedule}
            undo
            zoom
          />
        </ContextMenu>
        {api && <Editor api={api} />}
      </div>
    </>
  );
}

function MultiUser({ skinSettings }) {
  const [autoschedule, setAutoschedule] = useState(false);
  const schedule = useMemo(() => ({ auto: autoschedule }), [autoschedule]);

  return (
    <div className="rows wx-aabA5gZk">
      <div className="row config wx-aabA5gZk">
        <Checkbox
          label="Auto scheduling"
          value={autoschedule}
          onChange={({ value }) => setAutoschedule(value)}
        />
        <span className="pro wx-aabA5gZk">PRO</span>
      </div>
      {clients.map((label) => (
        <Client
          key={label}
          label={label}
          skinSettings={skinSettings}
          schedule={schedule}
        />
      ))}
    </div>
  );
}

export default MultiUser;
