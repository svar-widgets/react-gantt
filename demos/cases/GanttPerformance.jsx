import { useState, useEffect, useRef } from 'react';
import { getGeneratedData, complexScales } from '../data';
import { Gantt } from '../../src/';
import { Button } from '@svar-ui/react-core';
import './GanttPerformance.css';

function RenderTime({ start }){
  const [end, setEnd] = useState(null);
  const [label, setLabel] = useState('')

  let active = useRef(true);
  useEffect(() => {
    if (start && end) {
       setLabel((end - start)+" ms");
    }

    active.current = true;
    setTimeout(() => {
      active.current = false;
    }, 1000);
  }, [start, end]);
  
  window.__RENDER_METRICS_ENABLED__ = true;
  useEffect(() => {
    window.addEventListener('render-metric', (e) => {
      if (!active.current) return;
      if (e.detail.label === "chart") {
        setEnd(new Date());
      }
    });

    return () => {
      delete window.__RENDER_METRICS_ENABLED__
    };
  }, []);
  
  
  return <span>{label}</span>
}

const count = 10000;
const years = 3;
const data = getGeneratedData('', count, years);

function GanttPerformance(props) {
  const { skinSettings } = props;
  const [start, setStart] = useState(null);

  return (
    <div className="wx-KB3Eoqwm rows">
      <div className="wx-KB3Eoqwm row">
        {start ? (
          <>
            10 000 tasks ({years} years ) rendered in{' '}
            <RenderTime start={start} />
          </>
        ) : (
            <Button type="primary" onClick={() => setStart(new Date()) }>
            Press me to render Gantt chart with 10 000 tasks
          </Button>
        )}
      </div>

      {start ? (
        <div className="wx-KB3Eoqwm gtcell">
          <Gantt
            {...skinSettings}
            tasks={data.tasks}
            links={data.links}
            scales={complexScales}
          />
        </div>
      ) : null}
    </div>
  );
}

export default GanttPerformance;
