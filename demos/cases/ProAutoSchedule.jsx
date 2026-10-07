import { useState, useMemo } from 'react';
import { getData } from '../data';
import { Gantt, Editor, ContextMenu } from '../../src';
import { DatePicker, Field } from '@svar-ui/react-core';
import './ProAutoSchedule.css';

function ProAutoSchedule({ skinSettings }) {
  const [api, setApi] = useState(null);
  const [projectStart, setProjectStart] = useState(new Date(2026, 3, 2));

  const data = useMemo(() => getData(), []);

  return (
    <div className="demo wx-vkht5Uh1">
      <div className="bar wx-vkht5Uh1">
        <Field label="Project start" position="left">
          <DatePicker
            value={projectStart}
            onChange={({ value }) => setProjectStart(value)}
          />
        </Field>
      </div>
      <div className="gantt wx-vkht5Uh1">
        {api && <Editor api={api} />}
        <ContextMenu api={api}>
          <Gantt
            {...skinSettings}
            init={setApi}
            tasks={data.tasks}
            links={data.links}
            scales={data.scales}
            schedule={{ auto: true }}
            projectStart={projectStart}
            projectEnd={new Date(2026, 5, 2)}
            undo
          />
        </ContextMenu>
      </div>
    </div>
  );
}

export default ProAutoSchedule;
