import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useContext,
} from 'react';
import { hotkeys } from '@svar-ui/grid-store';
import { useStore, useWritableProp } from '@svar-ui/lib-react';
import Grid from './grid/Grid.jsx';
import Chart from './chart/Chart.jsx';
import Resizer from './Resizer.jsx';
import storeContext from '../context';
import './Layout.css';
import { flushSync } from 'react-dom';

function Layout(props) {
  const { taskTemplate, readonly, onTableAPIChange, onGanttWidthChange } = props;

  const api = useContext(storeContext);

  const rTasks = useStore(api, '_tasks');
  const rScales = useStore(api, '_scales');
  const rCellHeight = useStore(api, 'cellHeight');
  const rColumns = useStore(api, 'columns');
  const rScrollTop = useStore(api, 'scrollTop');
  const undo = useStore(api, 'undo');
  const gridWidth = useStore(api, 'gridWidth');
  const columnsWidth = useStore(api, '_columnsWidth');

  const [ganttWidth, setGanttWidth] = useWritableProp(props.ganttWidth);
  const [ganttHeight, setGanttHeight] = useState(0);
  const [innerWidth, setInnerWidth] = useState(undefined);

  const scrollSize = useMemo(
    () => (ganttWidth ?? 0) - (innerWidth ?? 0),
    [ganttWidth, innerWidth],
  );
  const fullWidth = useMemo(() => rScales.width, [rScales]);
  const fullHeight = useMemo(
    () => rTasks.length * rCellHeight,
    [rTasks, rCellHeight],
  );
  const scrollHeight = useMemo(
    () => rScales.height + fullHeight + scrollSize,
    [rScales, fullHeight, scrollSize],
  );

  const chartRef = useRef(null);

  const latestLayout = useRef({
    ganttWidth: 0,
    gridWidth: 0,
    ganttHeight: 0,
    rScalesHeight: 0,
    scrollSize: 0,
  });

  useEffect(() => {
    latestLayout.current = {
      ganttWidth: ganttWidth ?? 0,
      gridWidth,
      ganttHeight: ganttHeight ?? 0,
      rScalesHeight: rScales.height,
      scrollSize,
    };
  }, [ganttWidth, gridWidth, ganttHeight, rScales, scrollSize]);

  const chartResizeHandler = useCallback(() => {
    const {
      ganttWidth: gw,
      gridWidth: grw,
      ganttHeight: gh,
      rScalesHeight: sh,
      scrollSize: ss,
    } = latestLayout.current;
    api.exec('resize-chart', {
      width: gw - grw - ss - 4,
      height: gh - sh,
      scrollSize: ss,
    });
  }, [api]);

  useEffect(() => {
    let ro;
    if (chartRef.current) {
      ro = new ResizeObserver(chartResizeHandler);
      ro.observe(chartRef.current);
    }
    return () => {
      if (ro) ro.disconnect();
    };
  }, [chartRef.current, chartResizeHandler]);

  const ganttDivRef = useRef(null);
  const pseudoRowsRef = useRef(null);
  const expectedScrollTop = useRef(null);
  const isUserScrollRef = useRef(false);

  const onScroll = useCallback(() => {
    const el = ganttDivRef.current;
    if (el && el.scrollTop !== expectedScrollTop.current) {
      expectedScrollTop.current = el.scrollTop;
      isUserScrollRef.current = true;
      api.exec('scroll-chart', {
        top: el.scrollTop,
      });
    }
  }, [api]);

  useEffect(() => {
    const ganttDiv = ganttDivRef.current;
    const pseudoRows = pseudoRowsRef.current;
    if (!ganttDiv || !pseudoRows) return;
    const update = () => {
      flushSync(() => {
        setGanttHeight(ganttDiv.offsetHeight);
        setGanttWidth(ganttDiv.offsetWidth);
        setInnerWidth(pseudoRows.offsetWidth);
      });
    };
    const ro = new ResizeObserver(update);
    ro.observe(ganttDiv);
    return () => ro.disconnect();
  }, [ganttDivRef.current]);

  useEffect(() => {
    if (onGanttWidthChange) onGanttWidthChange(ganttWidth);
  }, [ganttWidth, onGanttWidthChange]);

  useEffect(() => {
    const ganttDiv = ganttDivRef.current;
    if (!ganttDiv) return;
    // change originated from the user's own scroll — don't write it back,
    // otherwise we re-trigger onScroll and loop (see Layout.svelte FIXME)
    if (isUserScrollRef.current) {
      isUserScrollRef.current = false;
      return;
    }
    // only programmatic scrolls (scrollToTask, etc.) reach here
    if (rScrollTop !== ganttDiv.scrollTop) {
      expectedScrollTop.current = rScrollTop;
      ganttDiv.scrollTop = rScrollTop;
    }
  }, [rScrollTop]);

  const layoutRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (cleanupRef.current) {
      cleanupRef.current.destroy();
      cleanupRef.current = null;
    }
    const node = layoutRef.current;
    if (!node) return;

    cleanupRef.current = hotkeys(node, {
      keys: {
        'ctrl+c': true,
        'ctrl+v': true,
        'ctrl+x': true,
        'ctrl+d': true,
        backspace: true,
        'ctrl+z': undo,
        'ctrl+y': undo,
      },
      exec: (ev) => {
        if (!ev.isInput) api.exec('hotkey', ev);
      },
    });

    return () => {
      cleanupRef.current?.destroy();
      cleanupRef.current = null;
    };
  }, [undo]);

  return (
    <div className="wx-jlbQoHOz wx-gantt" ref={ganttDivRef} onScroll={onScroll}>
      <div
        className="wx-jlbQoHOz wx-pseudo-rows"
        style={{ height: scrollHeight, width: '100%' }}
        ref={pseudoRowsRef}
      >
        <div
          className="wx-jlbQoHOz wx-stuck"
          style={{
            height: ganttHeight,
            width: innerWidth,
          }}
        >
          <div tabIndex={0} className="wx-jlbQoHOz wx-layout" ref={layoutRef}>
            {rColumns.length ? (
              <>
                <Grid
                  columnWidth={columnsWidth}
                  readonly={readonly}
                  fullHeight={fullHeight}
                  onTableAPIChange={onTableAPIChange}
                />
                <Resizer containerWidth={ganttWidth} api={api} />
              </>
            ) : null}

            <div className="wx-jlbQoHOz wx-content" ref={chartRef}>
              <Chart
                readonly={readonly}
                fullWidth={fullWidth}
                fullHeight={fullHeight}
                taskTemplate={taskTemplate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
