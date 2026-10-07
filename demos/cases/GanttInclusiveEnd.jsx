import { useMemo, useState } from 'react';
import { Gantt, Editor, ContextMenu, Tooltip } from '../../src';
import { Checkbox } from '@svar-ui/react-core';
import { getData } from '../data';
import MyInclusiveEndTooltip from '../custom/MyInclusiveEndTooltip.jsx';
import './GanttInclusiveEnd.css';

function GanttInclusiveEnd({ skinSettings }) {
  const data = useMemo(() => getData(), []);

  const [api, setApi] = useState(null);
  const [inclusiveEnd, setInclusiveEnd] = useState(true);

  const columns = useMemo(
    () => [
      { id: 'text', header: 'Task name', flexgrow: 1 },
      {
        id: 'start',
        header: 'Start',
        width: 100,
        align: 'center',
        editor: 'datepicker',
      },
      // shown by gantt: the default text and the editor
      {
        id: 'end',
        header: 'End',
        width: 100,
        align: 'center',
        editor: 'datepicker',
      },
      {
        id: 'duration',
        header: 'Duration',
        width: 100,
        align: 'center',
        editor: { type: 'text', config: { type: 'number' } },
      },
      { id: 'add-task', header: '', width: 50, align: 'center' },
    ],
    [],
  );

  return (
    <div className="demo wx-aacVEeRx">
      <div className="bar wx-aacVEeRx">
        <Checkbox
          value={inclusiveEnd}
          label="Inclusive end"
          onChange={({ value }) => setInclusiveEnd(value)}
        />
        <span className="hint wx-aacVEeRx">
          Grid, editor, and tooltips show the last day covered; bars and
          durations do not change
        </span>
      </div>
      <div className="gantt wx-aacVEeRx">
        <ContextMenu api={api}>
          <Tooltip api={api} content={MyInclusiveEndTooltip}>
            <Gantt
              {...skinSettings}
              init={setApi}
              tasks={data.tasks}
              links={data.links}
              scales={data.scales}
              columns={columns}
              inclusiveEnd={inclusiveEnd}
              gridWidth={540}
            />
          </Tooltip>
        </ContextMenu>
        {api && <Editor api={api} />}
      </div>
    </div>
  );
}

export default GanttInclusiveEnd;
