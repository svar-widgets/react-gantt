import { useMemo, useRef, useState } from 'react';
import { getData } from '../data';
import { Gantt, registerScaleUnit } from '../../src/';
import { Select } from '@svar-ui/react-core';
import {
  startOfMonth,
  endOfMonth,
  isSameMonth,
  addMonths,
  addDays,
  differenceInDays,
  format,
} from 'date-fns';
import './GanttMinScaleUnit.css';

const options = [
  { id: 1, label: 'sprint' },
  { id: 2, label: 'month, sprint' },
  { id: 3, label: 'month, sprint, week' },
  { id: 4, label: 'month, sprint, week, day' },
];

export default function GanttMinScaleUnit({ skinSettings }) {
  const data = useMemo(() => getData(), []);

  const getMidDate = (d) => {
    const m = d.getMonth();
    return m === 1 ? 15 : 16;
  };

  const sprintStart = (d) => {
    const monthStart = startOfMonth(d);
    const midDate = getMidDate(d);
    if (d.getDate() >= midDate) monthStart.setDate(midDate);
    return monthStart;
  };

  const sprintEnd = (d) => {
    const monthEnd = endOfMonth(d);
    const midDate = getMidDate(d);
    if (d.getDate() < midDate) monthEnd.setDate(midDate - 1);
    return monthEnd;
  };

  const sprintFormat = (d) => {
    const monthStr = format(d, 'MMMM');
    const start = d.getDate();
    const end = sprintEnd(d).getDate();
    return `${monthStr} ${start} - ${end}`;
  };

  const allScales = useMemo(
    () => [
      { unit: 'month', step: 1, format: '%F %Y' },
      { unit: 'sprint', step: 1, format: sprintFormat },
      { unit: 'week', step: 1, format: '%w' },
      { unit: 'day', step: 1, format: '%j' },
    ],
    [],
  );

  const [scaleOption, setScaleOption] = useState(2);

  const scales = useMemo(() => {
    if (scaleOption == 1) return [allScales[1]];
    if (scaleOption == 2) return allScales.slice(0, 2);
    if (scaleOption == 3) return allScales.slice(0, 3);
    return allScales;
  }, [scaleOption, allScales]);

  const getSmallerCount = (d) => {
    if (!d) return 15;
    const start = sprintStart(d).getDate();
    const end = sprintEnd(d).getDate();
    return end - start + 1;
  };

  const registeredRef = useRef(false);
  if (!registeredRef.current) {
    registerScaleUnit('sprint', {
      start: sprintStart,
      end: sprintEnd,
      isSame: (a, b) => {
        if (!a || !b) return true;
        const sameMonth = isSameMonth(a, b);
        if (!sameMonth) return false;
        const midDate = getMidDate(a);
        return a.getDate() < midDate == b.getDate() < midDate;
      },
      add: (d, amount) => {
        const date = d.getDate();
        const start = sprintStart(d);
        const diff = date - start.getDate();
        let newDate = addMonths(start, Math.floor(amount / 2));
        const midDate = getMidDate(newDate);
        if (amount % 2) {
          newDate = addDays(newDate, midDate);
          newDate = sprintStart(newDate);
        }
        return addDays(newDate, diff);
      },
      diff: (endDate, startDate) => {
        return Math.floor(differenceInDays(endDate, startDate) / 15) || 1;
      },
      smallerCount: {
        day: getSmallerCount,
        hour: (d) => getSmallerCount(d) * 24,
      },
      biggerCount: {
        year: 24,
        quarter: 6,
        month: 2,
      },
    });
    registeredRef.current = true;
  }

  return (
    <div className="demo wx-N6cE7fG9">
      <div className="bar wx-N6cE7fG9">
        <Select
          value={scaleOption}
          options={options}
          onChange={({ value }) => setScaleOption(value)}
        />
      </div>
      <div className="gantt wx-N6cE7fG9">
        <Gantt
          {...skinSettings}
          tasks={data.tasks}
          links={data.links}
          scales={scales}
          zoom={true}
          start={new Date(2026, 3, 1)}
          end={new Date(2026, 5, 1)}
          cellWidth={60}
        />
      </div>
    </div>
  );
}
