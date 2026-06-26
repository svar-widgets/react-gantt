import {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useContext,
  useCallback,
} from 'react';
import CellGrid from './CellGrid.jsx';
import Bars from './Bars.jsx';
import { hotkeys } from '@svar-ui/grid-store';
import { setID } from '@svar-ui/lib-dom';
import storeContext from '../../context';
import { useStore, useStoreWithCounter } from '@svar-ui/lib-react';
import './Chart.css';
import TimeScales from './TimeScale.jsx';
import { createZoomWheelHandler } from '../../helpers/zoom';
import { useRenderTime } from '../../helpers/debug.js';

function Chart(props) {
  const { readonly, fullWidth, fullHeight, taskTemplate } = props;

  const api = useContext(storeContext);

  const [selected, selectedCounter] = useStoreWithCounter(api, '_selected');
  const rScrollTop = useStore(api, 'scrollTop');
  const rScrollLeft = useStore(api, 'scrollLeft');
  const cellHeight = useStore(api, 'cellHeight');
  const rTasks = useStore(api, '_tasks');
  const resources = useStore(api, 'resources');
  const scales = useStore(api, '_scales');
  const area = useStore(api, 'area');
  const groupBy = useStore(api, 'groupBy');
  const xArea = useStore(api, 'xArea');
  const zoom = useStore(api, 'zoom');
  const calendars = useStore(api, '_calendars');
  const markers = useStore(api, '_markers');
  const highlightTime = useStore(api, 'highlightTime');

  const [chartHeight, setChartHeight] = useState();
  const chartRef = useRef(null);
  const expectedScroll = useRef({ top: null, left: null });
  const isUserScrollRef = useRef(false);

  const extraRows = 1;
  const selectStyle = useMemo(() => {
    const t = [];
    if (selected && selected.length && cellHeight) {
      selected.forEach((obj) => {
        t.push({ height: `${cellHeight}px`, top: `${obj.$y - 3}px` });
      });
    }
    return t;
  }, [selectedCounter, cellHeight]);

  const chartGridHeight = useMemo(
    () => Math.max(chartHeight || 0, fullHeight),
    [chartHeight, fullHeight],
  );

  useLayoutEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    if (isUserScrollRef.current) {
      isUserScrollRef.current = false;
      return;
    }

    if (typeof rScrollTop === 'number') {
      expectedScroll.current.top = rScrollTop;
      el.scrollTop = rScrollTop;
    }
    if (typeof rScrollLeft === 'number') {
      expectedScroll.current.left = rScrollLeft;
      el.scrollLeft = rScrollLeft;
    }
  }, [rScrollTop, rScrollLeft]);

  const onScroll = () => {
    const el = chartRef.current;
    if (!el) return;
    if (el.scrollLeft !== expectedScroll.current.left) {
      expectedScroll.current.left = el.scrollLeft;
      isUserScrollRef.current = true;
      api.exec('scroll-chart', { left: el.scrollLeft });
    }
  };

  function dataRequest() {
    const clientHeightLocal = chartHeight || 0;
    const num = Math.ceil(clientHeightLocal / (cellHeight || 1)) + 1;
    const pos = Math.floor((rScrollTop || 0) / (cellHeight || 1));
    const start = Math.max(0, pos - extraRows);
    const end = pos + num + extraRows;
    const from = start * (cellHeight || 0);
    api.exec('render-data', {
      start,
      end,
      from,
    });
  }

  useEffect(() => {
    dataRequest();
  }, [rScrollTop, chartHeight, cellHeight]);

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const onWheel = useMemo(
    () =>
      createZoomWheelHandler(
        api,
        () => zoomRef.current,
        () => chartRef.current,
      ),
    [api],
  );

  function getHoliday(cell) {
    const style = highlightTime?.(cell.date, cell.unit);
    if (style)
      return {
        css: style,
        width: cell.width,
      };
    return null;
  }

  const holidays = useMemo(() => {
    if (!highlightTime) return null;
    const cells = scales.rows[scales.rows.length - 1].cells;
    return cells.slice(xArea.start, xArea.end).map(getHoliday);
  }, [scales, highlightTime, xArea]);

  const timelineCells = useMemo(() => {
    const row = scales.rows[scales.rows.length - 1];
    const cells = row?.cells;
    return (scales.minUnit === 'hour' || scales.minUnit === 'day') && cells
      ? cells.slice(xArea.start, xArea.end)
      : [];
  }, [scales, xArea]);

  const visibleTasks = useMemo(
    () => rTasks.slice(area.start, area.end),
    [rTasks, area],
  );

  function getRowCalendars(task) {
    if (groupBy?.field === 'resource') {
      if (task.$resource) {
        const calendar = api.getResourceCalendar(task);
        return calendar ? [calendar] : [];
      }

      const groupValue = task.$groupValue;
      if (groupValue === undefined || groupValue === '$ungrouped') return [];

      const resourceIds = Array.isArray(groupValue) ? groupValue : [groupValue];

      return resourceIds.flatMap((id) => {
        const resource = resources?.byId(id);
        if (!resource) return [];
        const calendar = api.getResourceCalendar(resource);
        return calendar ? [calendar] : [];
      });
    }

    const calendar = task.calendar ? api.getTaskCalendar(task) : undefined;
    return calendar ? [calendar] : [];
  }

  const rowHighlights = useMemo(() => {
    const result = [];
    if (!calendars) return result;
    const globalCalendar = api.getCalendar();
    visibleTasks.forEach((task, index) => {
      const rowCalendars = getRowCalendars(task);
      if (!rowCalendars.length) return;
      timelineCells.forEach((cell, cellIndex) => {
        const nonWorkingCalendars = rowCalendars.filter(
          (cal) => !cal.isWorkingDay(cell.date),
        );
        const isRowWorkingDay = nonWorkingCalendars.length === 0;
        const isGlobalHoliday =
          globalCalendar && !globalCalendar.isWorkingDay(cell.date);

        const cellConfig = {
          width: cell.width,
          height: cellHeight,
          left: (cellIndex + xArea.start) * cell.width,
          top: area.from + index * cellHeight,
        };

        let css = '';
        if (!isRowWorkingDay) {
          const extra = nonWorkingCalendars
            .map((cal) => cal.css)
            .filter(Boolean);
          css = ['wx-weekend', ...extra].join(' ');
        }
        if (isRowWorkingDay && isGlobalHoliday) css = 'wx-weekend-override';

        if (css) result.push({ ...cellConfig, css });
      });
    });
    return result;
  }, [
    calendars,
    visibleTasks,
    timelineCells,
    cellHeight,
    xArea,
    area,
    groupBy,
    resources,
    api,
  ]);

  const handleHotkey = useCallback(
    (ev) => {
      ev.eventSource = 'chart';
      api.exec('hotkey', ev);
    },
    [api],
  );

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const update = () => setChartHeight(el.clientHeight);
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [chartRef.current]);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const cleanup = hotkeys(el, {
      keys: {
        arrowup: true,
        arrowdown: true,
      },
      exec: (v) => handleHotkey(v),
    });
    return () => {
      cleanup?.destroy();
    };
  }, []);

  useEffect(() => {
    const node = chartRef.current;
    if (!node) return;

    const handler = onWheel;
    node.addEventListener('wheel', handler);
    return () => {
      node.removeEventListener('wheel', handler);
    };
  }, [onWheel]);

  useRenderTime("chart");

  return (
    <div
      className="wx-mR7v2Xag wx-chart"
      tabIndex={-1}
      ref={chartRef}
      onScroll={onScroll}
    >
      <TimeScales api={api} />
      {markers && markers.length ? (
        <div
          className="wx-mR7v2Xag wx-markers"
          style={{ height: `${chartGridHeight}px` }}
        >
          {markers.map((marker, i) => (
            <div
              key={i}
              className={`wx-mR7v2Xag wx-marker ${marker.css || ''}`}
              style={{ left: `${marker.left}px` }}
            >
              <div className="wx-mR7v2Xag wx-content">{marker.text}</div>
            </div>
          ))}
        </div>
      ) : null}

      <div
        className="wx-mR7v2Xag wx-area"
        style={{ width: `${fullWidth}px`, height: `${chartGridHeight}px` }}
      >
        {holidays ? (
          <div
            className="wx-mR7v2Xag wx-gantt-holidays"
            style={{ height: '100%' }}
          >
            {holidays.map((holiday, i) =>
              holiday ? (
                <div
                  key={i}
                  className={'wx-mR7v2Xag ' + holiday.css}
                  style={{
                    width: `${holiday.width}px`,
                    left: `${xArea.from + i * holiday.width}px`,
                  }}
                />
              ) : null,
            )}
          </div>
        ) : null}

        {rowHighlights.map((row, index) => (
          <div
            key={index}
            className={'wx-mR7v2Xag ' + row.css}
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              width: `${row.width}px`,
              height: `${row.height}px`,
              left: `${row.left}px`,
              top: `${row.top}px`,
            }}
          />
        ))}

        {selected && selected.length
          ? selected.map((obj, index) =>
              obj.$y ? (
                <div
                  key={obj.id}
                  className="wx-mR7v2Xag wx-selected"
                  data-id={setID(obj.id)}
                  style={selectStyle[index]}
                ></div>
              ) : null,
            )
          : null}

        <CellGrid />

        <Bars readonly={readonly} taskTemplate={taskTemplate} />
      </div>
    </div>
  );
}

export default Chart;
