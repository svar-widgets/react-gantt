import { useMemo, useState } from 'react';
import { getData } from '../data';
import { Gantt } from '../../src/';
import { RadioButtonGroup, DatePicker } from '@svar-ui/react-core';
import './ProProgressLine.css';

const MODE_OFF = 0;
const MODE_DATE = 1;

const options = ['Off', 'Custom date'].map((label, id) => ({
  id,
  label,
}));

function ProProgressLine({ skinSettings }) {
  const [mode, setMode] = useState(MODE_DATE);
  const [date, setDate] = useState(() => new Date('2026-04-04T00:00:00'));
  const progressLine = useMemo(
    () => (mode === MODE_OFF ? false : date),
    [mode, date],
  );

  const data = useMemo(() => getData(), []);

  return (
    <div className="rows wx-aaacULsy">
      <div className="bar wx-aaacULsy">
        <RadioButtonGroup
          options={options}
          type="inline"
          value={mode}
          onChange={({ value }) => setMode(value)}
        />
        <div className="wx-aaacULsy">
          <DatePicker
            disabled={mode !== MODE_DATE}
            value={date}
            onChange={({ value }) => setDate(value)}
          />
        </div>
      </div>
      <div className="gtcell wx-aaacULsy">
        <Gantt
          {...skinSettings}
          progressLine={progressLine}
          tasks={data.tasks}
          links={data.links}
          scales={data.scales}
          cellWidth={20}
          zoom
        />
      </div>
    </div>
  );
}

export default ProProgressLine;
