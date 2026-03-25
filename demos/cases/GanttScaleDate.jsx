import { useState, useMemo } from 'react';
import { getData } from '../data';
import { Gantt } from '../../src/';
import { Button, Locale } from '@svar-ui/react-core';
import './GanttScaleDate.css';

function GanttScaleDate({ skinSettings }) {
  const data = useMemo(() => getData(), []);
  const [api, setApi] = useState(null);

  function init(ganttApi) {
    setApi(ganttApi);
  }

  function scrollToStart() {
    api.exec('scroll-chart', { date: new Date() });
  }

  function scrollToEnd() {
    api.exec('scroll-chart', { date: new Date(2026, 5, 1) });
  }

  return (
    <div className="wx-aadXqRiz demo">
      <Locale>
        <div className="wx-aadXqRiz bar">
          <Button onClick={scrollToStart}>Scroll to scale start</Button>
          <Button onClick={scrollToEnd}>Scroll to scale end</Button>
        </div>
      </Locale>

      <div className="wx-aadXqRiz gantt">
        <Gantt
          init={init}
          {...skinSettings}
          tasks={data.tasks}
          links={data.links}
          scales={data.scales}
          zoom
        />
      </div>
    </div>
  );
}

export default GanttScaleDate;
