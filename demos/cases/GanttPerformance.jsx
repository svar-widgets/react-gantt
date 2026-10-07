import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Gantt } from '../../src/';
import { Button, Checkbox, Select } from '@svar-ui/react-core';
import './GanttPerformance.css';

// one summary with N chained leaves, one e2s link per consecutive pair.
// Every link starts violated by a day, so a forward pass cascades the whole chain
function getChainedData(maxSize, maxYears) {
  maxYears = maxYears || 2;
  maxSize = maxSize || 1000;

  const tasks = [
    {
      id: -1,
      text: 'Tasks',
      parent: 0,
      type: 'summary',
      open: true,
    },
  ];
  const links = [];

  for (let i = 1; i <= maxSize; i++) {
    const ii = i % (365 * maxYears);
    const start = 2 + ii - (ii >= 13 ? 12 : 0);

    tasks.push({
      id: i,
      start: new Date(2026, 2, start),
      end: new Date(2026, 2, start + 2),
      text: 'Task ' + i,
      progress: (i % 10) * 10,
      parent: -1,
      type: 'task',
    });

    if (i > 1)
      links.push({
        id: i - 1,
        source: i - 1,
        target: i,
        type: 'e2s',
      });
  }

  return { tasks, links };
}

const years = 2;
const fmt = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const options = [1000, 5000, 10000, 50000, 100000].map((id) => ({
  id,
  label: fmt(id),
}));

function GanttPerformance(props) {
  const { skinSettings } = props;

  const [count, setCount] = useState(1000);
  const [auto, setAuto] = useState(false);
  const [data, setData] = useState(null);
  const [start, setStart] = useState(null);
  const [renderKey, setRenderKey] = useState(0);
  const outArea = useRef(null);
  const ganttArea = useRef(null);

  // what the last scheduling pass cost: a drag drop, or the "auto" toggle
  const [pass, setPass] = useState(null);

  const t0 = useRef(0); // 0 = no pass being timed
  const depth = useRef(0); // nesting of update-task, the cascade re-enters the same bus
  const cascade = useRef(0);
  const bracketed = useRef(false);
  const frame = useRef(0);

  const beginPass = useCallback((label) => {
    cascade.current = 0;
    setPass({ label, sync: null, paint: null, cascade: 0 });
    t0.current = performance.now();
  }, []);

  const initApi = useCallback(
    (api) => {
      // intercept runs ahead of the store handler, on() runs after it, so the
      // pair brackets the synchronous pass: graph, forward walk and cascade
      api.intercept('update-task', (ev) => {
        // a pass whose sync phase is closed but never published is stale,
        // so a new top-level edit takes over instead of being counted into it
        if (
          !depth.current &&
          !ev.inProgress &&
          (!t0.current || !bracketed.current)
        ) {
          beginPass(ev.eventSource ? `${ev.eventSource} edit` : 'drag');
          bracketed.current = true;
          // a cancelled nested event would leave the counter open
          setTimeout(() => (depth.current = 0), 0);
        } else if (t0.current) cascade.current++;
        depth.current++;
      });

      api.on('update-task', () => {
        if (depth.current) depth.current--;
        if (!depth.current && bracketed.current) {
          bracketed.current = false;
          const c = cascade.current;
          const sync = Math.round(performance.now() - t0.current);
          setPass((p) => ({ ...p, cascade: c, sync }));
        }
      });

      // the pass publishes through setStateAsync, one timer later; the last
      // publish before a repaint is where the user actually sees the result
      api.getReactiveState().tasks.subscribe(() => {
        if (!t0.current) return;
        const started = t0.current;
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => {
          const c = cascade.current;
          const paint = Math.round(performance.now() - started);
          setPass((p) => ({ ...p, cascade: c, paint }));
          if (t0.current === started) t0.current = 0;
        });
      });
    },
    [beginPass],
  );

  function render() {
    // a fresh dataset each time, so a previous scheduling pass
    // doesn't become the starting point of the next measurement
    setData({ ...getChainedData(count, years), count });
    setRenderKey((k) => k + 1);
    setStart(new Date());
    setPass(null);
    t0.current = depth.current = cascade.current = 0;
    bracketed.current = false;
  }

  function onAutoChange(ev) {
    setAuto(ev.value);
    // only switching it on runs a pass; switching it off does no work
    if (data && ev.value) beginPass('auto scheduling on');
  }

  // tasks can appear a commit later (after the chart is sized),
  // so report the time once the bars are in the DOM
  useEffect(() => {
    if (!start) return;
    let id;
    const check = () => {
      if (ganttArea.current?.querySelector('.wx-bar')) {
        if (outArea.current) outArea.current.textContent = new Date() - start;
      } else id = requestAnimationFrame(check);
    };
    check();
    return () => cancelAnimationFrame(id);
  }, [start]);

  const schedule = useMemo(() => ({ auto }), [auto]);

  return (
    <div className="wx-KB3Eoqwm rows">
      <div className="wx-KB3Eoqwm row">
        <div className="wx-KB3Eoqwm selector">
          <Select
            value={count}
            options={options}
            onChange={({ value }) => setCount(value)}
          />
        </div>
        <div className="wx-KB3Eoqwm auto">
          <Checkbox
            value={auto}
            label="Auto scheduling"
            onChange={onAutoChange}
          />
          <span className="wx-KB3Eoqwm pro">PRO</span>
        </div>
        <Button type="primary" onClick={render}>
          Render tasks
        </Button>
        {start ? (
          <div className="wx-KB3Eoqwm">
            {fmt(data.count)} chained tasks rendered in{' '}
            <span ref={outArea}></span> ms
          </div>
        ) : null}
        {pass ? (
          <div className="wx-KB3Eoqwm">
            {pass.label}: {pass.sync === null ? '-' : pass.sync} ms sync /{' '}
            {pass.paint === null ? '-' : pass.paint} ms to paint ({pass.cascade}{' '}
            cascade updates )
          </div>
        ) : null}
      </div>

      {data ? (
        <div key={renderKey} ref={ganttArea} className="wx-KB3Eoqwm gtcell">
          <Gantt
            {...skinSettings}
            init={initApi}
            tasks={data.tasks}
            links={data.links}
            schedule={schedule}
          />
        </div>
      ) : null}
    </div>
  );
}

export default GanttPerformance;
