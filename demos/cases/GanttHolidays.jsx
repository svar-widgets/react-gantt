import { useMemo, useState } from 'react';
import { getData } from '../data';
import { Gantt } from '../../src/';
import { getISOWeek, getQuarter, startOfWeek } from 'date-fns';
import { Checkbox } from '@svar-ui/react-core';
import './GanttHolidays.css';

function GanttHolidays({ skinSettings }) {
  const data = useMemo(() => getData(), []);

  const [sabbaticalYear, setSabbaticalYear] = useState(false);
  const [summerBreak, setSummerBreak] = useState(false);

  const [everySecondWeekOff, setEverySecondWeekOff] = useState(false);
  const [everySecondQuarterOff, setEverySecondQuarterOff] = useState(false);

  const zoomLevel = {
    year: 0,
    quarter: 1,
    month: 2,
    week: 3,
    day: 4,
  };

  const [activeZoomLevel, setActiveZoomLevel] = useState(zoomLevel.day);

  function onHolidayToggle(level, ev) {
    if (ev.value) setActiveZoomLevel(level);
  }

  const scales = useMemo(
    () => [
      { unit: 'year', step: 1, format: '%Y' },
      { unit: 'month', step: 2, format: '%F %Y' },
      { unit: 'week', step: 1, format: 'Week %W' },
      { unit: 'day', step: 1, format: '%j, %l' },
    ],
    [],
  );

  function isDayOff(date) {
    const d = date.getDay();
    return d == 0 || d == 6;
  }

  function isHourOff(date) {
    const h = date.getHours();
    return h < 8 || h == 12 || h > 17;
  }

  function isYearOff(date) {
    return sabbaticalYear && date.getFullYear() === 2026;
  }

  function isQuarterOff(date) {
    if (summerBreak && [6, 7, 8].includes(date.getMonth())) return true;
    if (!everySecondQuarterOff) return false;
    return getQuarter(date) === 2;
  }

  function isMonthOff(date) {
    return summerBreak && [6, 7, 8].includes(date.getMonth());
  }

  function isWeekOff(date) {
    if (!everySecondWeekOff) return false;
    const week = startOfWeek(date, { weekStartsOn: 0 });
    return getISOWeek(week) % 2 === 0;
  }

  const off = {
    year: isYearOff,
    quarter: isQuarterOff,
    month: isMonthOff,
    week: isWeekOff,
    day: isDayOff,
    hour: isHourOff,
  };

  function highlightTime(d, u) {
    for (const unit in off) {
      if (off[unit](d)) return 'wx-weekend';
      if (unit === u) break;
    }
    return '';
  }

  return (
    <div className="demo wx-aabQtWhE">
      <div className="bar wx-aabQtWhE">
        <Checkbox
          value={sabbaticalYear}
          label="Sabbatical year 2026"
          onChange={(ev) => {
            setSabbaticalYear(ev.value);
            onHolidayToggle(zoomLevel.year, ev);
          }}
        />
        <Checkbox
          value={everySecondQuarterOff}
          label="Q2 off"
          onChange={(ev) => {
            setEverySecondQuarterOff(ev.value);
            onHolidayToggle(zoomLevel.quarter, ev);
          }}
        />
        <Checkbox
          value={summerBreak}
          label="Summer break"
          onChange={(ev) => {
            setSummerBreak(ev.value);
            onHolidayToggle(zoomLevel.month, ev);
          }}
        />
        <Checkbox
          value={everySecondWeekOff}
          label="Every second week off"
          onChange={(ev) => {
            setEverySecondWeekOff(ev.value);
            onHolidayToggle(zoomLevel.week, ev);
          }}
        />
      </div>
      <div className="gantt wx-aabQtWhE">
        <Gantt
          {...skinSettings}
          tasks={data.tasks}
          links={data.links}
          scales={scales}
          highlightTime={highlightTime}
          zoom={{ level: activeZoomLevel }}
        />
      </div>
    </div>
  );
}

export default GanttHolidays;
