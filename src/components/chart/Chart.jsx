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
import { useRenderTime } from '../../helpers/debug.js';

function Chart(props) {
  const {
    readonly,
    fullWidth,
    fullHeight,
    taskTemplate,
    cellBorders,
    highlightTime,
  } = props;

  const api = useContext(storeContext);

  const [selected, selectedCounter] = useStoreWithCounter(api, '_selected');
  const rScrollTop = useStore(api, 'scrollTop');
  const rScrollLeft = useStore(api, 'scrollLeft');
  const cellHeight = useStore(api, 'cellHeight');
  const scales = useStore(api, '_scales');
  const markers = useStore(api, '_markers');
  const zoom = useStore(api, 'zoom');

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
    setScroll();
    dataRequest();
  };

  function setScroll() {
    const el = chartRef.current;
    if (!el) return;
    const ev = {};
    //prevents infinite scroll
    if (el.scrollTop !== expectedScroll.current.top) ev.top = el.scrollTop;
    if (el.scrollLeft !== expectedScroll.current.left) ev.left = el.scrollLeft;
    if (!Object.keys(ev).length) return;
    // set expectedScroll so that rapid scroll events don't re-dispatch stale values
    if (ev.top !== undefined) expectedScroll.current.top = ev.top;
    if (ev.left !== undefined) expectedScroll.current.left = ev.left;
    isUserScrollRef.current = true;
    api.exec('scroll-chart', ev);
  }

  function dataRequest() {
    const el = chartRef.current;
    const clientHeightLocal = chartHeight || 0;
    const num = Math.ceil(clientHeightLocal / (cellHeight || 1)) + 1;
    const pos = Math.floor(((el && el.scrollTop) || 0) / (cellHeight || 1));
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
  }, [chartHeight]);

  const lastWheelTimeRef = useRef(performance.now());
  const pendingRef = useRef(false);
  const MAX_ZOOM_RATE = 0.003;

  function clamp(value, min, max) {
    return Math.max(Math.min(value, max), min);
  }

  function getZoomFactor(evDelta) {
    const isTouchpad = Math.abs(evDelta) < 50;
    const SENSITIVITY = isTouchpad ? 0.004 : 0.01;
    const now = performance.now();
    const dt = Math.min(now - lastWheelTimeRef.current, 50);
    lastWheelTimeRef.current = now;
    const normalized = clamp(
      -evDelta * SENSITIVITY,
      -MAX_ZOOM_RATE * dt,
      MAX_ZOOM_RATE * dt,
    );
    return Math.exp(normalized);
  }

  const onWheel = useCallback((e) => {
    if (zoom && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const el = chartRef.current;
      const ratio = getZoomFactor(e.deltaY);
      const offset = e.clientX - (el ? el.getBoundingClientRect().left : 0);
      if (!pendingRef.current) {
        pendingRef.current = true;
        requestAnimationFrame(() => {
          api.exec('zoom-scale', {
            dir: ratio > 1 ? 1 : -1,
            ratio: Math.abs(1 - ratio),
            offset,
          });
          pendingRef.current = false;
        });
      }
    }
  }, [zoom, api]);

  function getHoliday(cell) {
    const style = highlightTime(cell.date, cell.unit);
    if (style)
      return {
        css: style,
        width: cell.width,
      };
    return null;
  }

  const holidays = useMemo(() => {
    return scales &&
      (scales.minUnit === 'hour' || scales.minUnit === 'day') &&
      highlightTime
      ? scales.rows[scales.rows.length - 1].cells.map(getHoliday)
      : null;
  }, [scales, highlightTime]);

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

  const cleanupRef = useRef(null);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    if (cleanupRef.current) return;
    cleanupRef.current = hotkeys(el, {
      keys: {
        arrowup: true,
        arrowdown: true,
      },
      exec: (v) => handleHotkey(v),
    });
    return () => {
      cleanupRef.current?.destroy();
      cleanupRef.current = null;
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
      <TimeScales highlightTime={highlightTime} scales={scales} />
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
                    left: `${i * holiday.width}px`,
                  }}
                />
              ) : null,
            )}
          </div>
        ) : null}

        <CellGrid borders={cellBorders} />

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

        <Bars readonly={readonly} taskTemplate={taskTemplate} />
      </div>
    </div>
  );
}

export default Chart;
