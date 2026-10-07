import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useContext,
} from 'react';
import { hotkeys } from '@svar-ui/grid-store';
import { toggleGridChart, toggleChartSubGrid } from '@svar-ui/gantt-store';
import { useStore } from '@svar-ui/lib-react';
import Grid from './grid/Grid.jsx';
import Chart from './chart/Chart.jsx';
import Resizer from './Resizer.jsx';
import storeContext from '../context';
import { getResizerUi } from '../helpers/resizer.js';
import './Layout.css';
import { flushSync } from 'react-dom';

const EMPTY_ARRAY = [];

function Layout(props) {
  const { taskTemplate, readonly, onTableAPIChange, onSubGridTableAPIChange } =
    props;

  const api = useContext(storeContext);

  const rTasks = useStore(api, '_tasks');
  const rScales = useStore(api, '_scales');
  const rCellHeight = useStore(api, 'cellHeight');
  const rColumns = useStore(api, '_columns');
  const rScrollTop = useStore(api, 'scrollTop');
  const undo = useStore(api, 'undo');
  const columnsWidth = useStore(api, '_columnsWidth');
  const gridWidth = useStore(api, 'gridWidth');
  const subGridWidth = useStore(api, 'subGridWidth');
  const displayPanelsVal = useStore(api, '_displayPanels');
  const compactMode = useStore(api, '_compactMode');
  const displayPanels = displayPanelsVal || EMPTY_ARRAY;

  const hasSubGrid = useMemo(
    () => (rColumns || EMPTY_ARRAY).some((c) => c.section === 'subGrid'),
    [rColumns],
  );
  const [drag, setDrag] = useState(null);
  const layoutPanels = drag?.panels ?? displayPanels;
  const subGridVisible = displayPanels.includes('subGrid');
  const chartVisible = displayPanels.includes('chart');
  const showSubGridResizer =
    hasSubGrid && (chartVisible || drag?.section === 'subGrid');
  // 4px per resizer; the subGrid one is shown only next to the chart
  const resizerWidth = hasSubGrid && chartVisible ? 8 : 4;
  const effectiveSubGridWidth = subGridVisible ? subGridWidth : 0;

  const gridChartResizerUi = useMemo(
    () => getResizerUi('gridChart', layoutPanels, compactMode),
    [layoutPanels, compactMode],
  );
  const subGridResizerUi = useMemo(
    () => getResizerUi('subGrid', layoutPanels, compactMode),
    [layoutPanels, compactMode],
  );

  const [ganttWidth, setGanttWidth] = useState(undefined);
  const [ganttHeight, setGanttHeight] = useState(undefined);
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

  function startDrag(section) {
    setDrag({ section, panels: [...displayPanels] });
  }

  function resizeGrid(section, width, commit) {
    api.exec('resize-grid', { width, section, inProgress: !commit });
    if (commit) setDrag(null);
  }

  function onExpandStart() {
    api.exec('set-display-mode', {
      mode: toggleGridChart(displayPanels, 'start', compactMode),
    });
  }
  function onExpandEnd() {
    api.exec('set-display-mode', {
      mode: toggleGridChart(displayPanels, 'end', compactMode),
    });
  }

  function toggleSubGridStart() {
    api.exec('set-display-mode', {
      mode: toggleChartSubGrid(displayPanels, 'start', compactMode),
    });
  }
  function toggleSubGridEnd() {
    api.exec('set-display-mode', {
      mode: toggleChartSubGrid(displayPanels, 'end', compactMode),
    });
  }

  useEffect(() => {
    if (ganttWidth == null || drag) return;

    const width =
      ganttHeight != null && chartVisible
        ? ganttWidth -
          columnsWidth -
          effectiveSubGridWidth -
          resizerWidth -
          scrollSize
        : 0;
    const height = ganttHeight != null ? ganttHeight - rScales.height : 0;

    api.exec('resize-chart', {
      width,
      height,
      scrollSize,
      ganttWidth,
    });
  }, [
    api,
    ganttWidth,
    ganttHeight,
    drag,
    chartVisible,
    columnsWidth,
    effectiveSubGridWidth,
    resizerWidth,
    scrollSize,
    rScales,
  ]);

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
    // pseudo-rows width changes when the vertical scrollbar appears/disappears
    ro.observe(pseudoRows);
    return () => ro.disconnect();
  }, [ganttDivRef.current]);

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

  useEffect(() => {
    const node = layoutRef.current;
    if (!node) return;

    const cleanup = hotkeys(node, {
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
      cleanup?.destroy();
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
                <Grid readonly={readonly} onTableAPIChange={onTableAPIChange} />
                <Resizer
                  side="left"
                  panelWidth={gridWidth}
                  {...gridChartResizerUi}
                  onResizeStart={() => startDrag('grid')}
                  onResize={(width) => resizeGrid('grid', width)}
                  onResizeEnd={(width) => resizeGrid('grid', width, true)}
                  onExpandStart={onExpandStart}
                  onExpandEnd={onExpandEnd}
                />
              </>
            ) : null}

            <div
              className={
                'wx-jlbQoHOz wx-content' +
                (chartVisible ? ' wx-content-visible' : '')
              }
            >
              <Chart
                readonly={readonly}
                fullWidth={fullWidth}
                fullHeight={fullHeight}
                taskTemplate={taskTemplate}
              />
            </div>

            {hasSubGrid && showSubGridResizer ? (
              // Mounted only while chart is open; grid+subGrid uses grid/chart resizer
              <Resizer
                side="right"
                panelWidth={subGridWidth}
                resizeInvert
                {...subGridResizerUi}
                onResizeStart={() => startDrag('subGrid')}
                onResize={(width) => resizeGrid('subGrid', width)}
                onResizeEnd={(width) => resizeGrid('subGrid', width, true)}
                onExpandStart={toggleSubGridStart}
                onExpandEnd={toggleSubGridEnd}
              />
            ) : null}
            {hasSubGrid && subGridVisible ? (
              <Grid
                section="subGrid"
                readonly={readonly}
                onTableAPIChange={onSubGridTableAPIChange}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
