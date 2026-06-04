import { useMemo, useState } from 'react';
import { getData, bigScales } from '../data';
import { Gantt } from '../../src/';
import { Select } from '@svar-ui/react-core';
import './GanttLengthUnit.css';

function GanttLengthUnit({ skinSettings }) {
  const data = useMemo(() => getData(), []);

  const options = [
    { id: 'minute', label: 'Minute' },
    { id: 'hour', label: 'Hour' },
    { id: 'day', label: 'Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'quarter', label: 'Quarter' },
  ];

  const [lengthUnit, setLengthUnit] = useState('day');

  const scales = useMemo(() => {
    let scales;
    switch (lengthUnit) {
      case 'minute':
        scales = [
          { unit: 'day', step: 1, format: '%M %j' },
          { unit: 'hour', step: 1, format: '%H:%i' },
        ];
        break;
      case 'hour':
        scales = [
          { unit: 'month', step: 1, format: '%M' },
          { unit: 'day', step: 1, format: '%M %j' },
        ];
        break;
      case 'day':
        scales = [
          { unit: 'month', step: 1, format: '%M' },
          { unit: 'week', step: 1, format: '%w' },
        ];
        break;
      case 'week':
        scales = [
          { unit: 'year', step: 1, format: '%Y' },
          { unit: 'month', step: 1, format: '%M' },
        ];
        break;
      case 'month':
        scales = [
          { unit: 'year', step: 1, format: '%Y' },
          { unit: 'quarter', step: 1, format: '%Q' },
        ];
        break;
      case 'quarter':
        scales = [{ unit: 'year', step: 1, format: '%Y' }];
        break;
      default:
        scales = bigScales;
    }
    return scales;
  }, [lengthUnit]);

  return (
    <div className="demo wx-M5bD8hJk">
      <div className="bar wx-M5bD8hJk">
        <Select
          value={lengthUnit}
          options={options}
          onChange={({ value }) => setLengthUnit(value)}
        />
      </div>
      <div className="gantt wx-M5bD8hJk">
        <Gantt
          {...skinSettings}
          tasks={data.tasks}
          links={data.links}
          scales={scales}
          lengthUnit={lengthUnit}
          cellWidth={300}
        />
      </div>
    </div>
  );
}

export default GanttLengthUnit;
