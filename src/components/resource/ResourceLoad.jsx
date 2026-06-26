import {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useContext,
  useCallback,
} from 'react';
import { locateID } from '@svar-ui/lib-dom';
import { getResourceColumns, normalizeResourceColumns } from '@svar-ui/gantt-store';
import { locale } from '@svar-ui/lib-dom';
import { en } from '@svar-ui/gantt-locales';
import { en as coreEn } from '@svar-ui/core-locales';
import { getValue } from '@svar-ui/grid-store';
import { useStore } from '@svar-ui/lib-react';
import { context } from '@svar-ui/react-core';

import { Grid } from '@svar-ui/react-grid';
import TimeScales from '../chart/TimeScale.jsx';
import Resizer from '../Resizer.jsx';
import NameCell from './NameCell.jsx';
import NameCellCompact from './NameCellCompact.jsx';
import LoadCell from './LoadCell.jsx';

import {
  getFlexBasis,
  getFitColumns,
  getFillColumn,
  getColumnsWidth,
  getSortMarks,
  getResourceLoadColumns,
  getScrollbarWidth,
} from '../../helpers/grid';
import { createZoomWheelHandler } from '../../helpers/zoom';

import './ResourceLoad.css';

function ResourceLoad(props) {
  const { api, mode = 'grid', template } = props;

  const columns = useMemo(
    () => props.columns || getResourceColumns(),
    [props.columns],
  );

  // detect scrollbar width that may differ in browsers
  const [scrollbarWidth, setScrollbarWidth] = useState(17);
  useEffect(() => {
    const width = getScrollbarWidth();
    setScrollbarWidth((prev) => (prev === width ? prev : width));
  }, []);

  const rResources = useStore(api, '_resources');
  const rScales = useStore(api, '_scales');
  const rResourceSort = useStore(api, '_resourceSort');
  const cellHeight = useStore(api, 'cellHeight');
  const ganttColumns = useStore(api, 'columns');
  const gridWidth = useStore(api, 'gridWidth');
  const displayMode = useStore(api, 'displayMode');
  const headerLength = useStore(api, '_headerLength');
  const highlightTime = useStore(api, 'highlightTime');
  const columnsWidth = useStore(api, '_columnsWidth');
  const gridCollapseThreshold = useStore(api, '_gridCollapseThreshold');
  const cellBorders = useStore(api, 'cellBorders');
  const zoom = useStore(api, 'zoom');

  const lFromCtx = useContext(context.i18n);
  const l = useMemo(() => lFromCtx || locale({ ...en, ...coreEn }), [lFromCtx]);
  const _ = useMemo(() => l.getGroup('gantt'), [l]);

  const [containerWidth, setContainerWidth] = useState(0);
  const [gridClientWidth, setGridClientWidth] = useState(0);
  const [rightContainerHeight, setRightContainerHeight] = useState(0);

  const containerRef = useRef(null);
  const gridContainerRef = useRef(null);
  const scaleContainerRef = useRef(null);
  const scalesDiv = useRef(null);
  const chartContainerRef = useRef(null);

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const leftApiRef = useRef(null);
  const rightApiRef = useRef(null);
  const scrollLeftRef = useRef(0);
  const expectedScrollLeftRef = useRef(0);
  const isUserScrollRef = useRef(false);

  const [selectedRows, setSelectedRows] = useState([]);

  const finalColumns = useMemo(() => {
    if (!columns || !columns.length) return [];
    let cols = normalizeResourceColumns(columns).map((col) => {
      col = { ...col };
      const header = col.header;
      if (typeof header === 'object') {
        const text = header.text && _(header.text);
        col.header = { ...header, text };
      } else col.header = _(header);

      col.align = col.align || 'left';
      col.editor = false;
      return col;
    });
    const ni = cols.findIndex((c) => c.id === 'name');

    if (ni !== -1) {
      if (cols[ni].cell) cols[ni]._cell = cols[ni].cell;
      cols[ni] = {
        ...cols[ni],
        header: displayMode === 'chart' ? '' : cols[ni].header,
        cell: displayMode === 'chart' ? NameCellCompact : NameCell,
      };
    }

    if (cols.length > 0) cols[cols.length - 1].resize = false;
    return cols;
  }, [columns, _, displayMode]);

  const sortMarks = useMemo(
    () => getSortMarks(rResources, rResourceSort),
    [rResources, rResourceSort]
  );

  const [columnWidth, setColumnWidth] = useState(0);

  useEffect(() => {
    let width;
    if (columnsWidth) width = columnsWidth;
    else if (displayMode === 'chart') width = gridCollapseThreshold || 0;
    else width = gridWidth;
    setColumnWidth((prev) => (prev === width ? prev : width));
  }, [columnsWidth, displayMode, gridCollapseThreshold, gridWidth]);

  const fitColumns = useMemo(
    () => getFitColumns(finalColumns, displayMode, 'name'),
    [finalColumns, displayMode]
  );

  const finalColumnsRef = useRef(finalColumns);
  useEffect(() => {
    finalColumnsRef.current = finalColumns;
  }, [finalColumns]);

  const rightColumns = useMemo(
    () => getResourceLoadColumns(rScales, LoadCell, template),
    [rScales, template]
  );

  const flexBasis = useMemo(
    () => getFlexBasis(ganttColumns || [], displayMode, gridWidth),
    [ganttColumns, displayMode, gridWidth]
  );

  // right grid V-scroll eats one scrollbar width on the right; timescales
  // must match so the time axis aligns at horizontal-max.
  const rightHasHScroll = useMemo(
    () => (rScales?.width ?? 0) > containerWidth - gridClientWidth,
    [rScales, containerWidth, gridClientWidth]
  );

  const rightHasVScroll = useMemo(() => {
    const contentH = rResources?.length * cellHeight;
    const viewportH =
      rightContainerHeight - (rightHasHScroll ? scrollbarWidth : 0);
    return contentH > viewportH;
  }, [
    rResources,
    cellHeight,
    rightContainerHeight,
    rightHasHScroll,
    scrollbarWidth,
  ]);

  // left grid only overflows once its own X scrollbar appears. If the Y
  // scrollbar is clipped, that hidden strip also delays the X overflow.
  const leftHasHScroll = useMemo(
    () => columnWidth > gridClientWidth + (rightHasVScroll ? scrollbarWidth : 0),
    [columnWidth, gridClientWidth, rightHasVScroll, scrollbarWidth]
  );

  const syncHorizontalScroll = useCallback((left) => {
    expectedScrollLeftRef.current = left;

    rightApiRef.current?.exec('scroll-to', { left });
    if (scalesDiv.current && Math.abs(scalesDiv.current.scrollLeft - left) > 1)
      scalesDiv.current.scrollLeft = left;
  }, []);

  useLayoutEffect(() => {
    if (!api) return;

    const scrollLeftStore = api.getReactiveState?.().scrollLeft;
    if (!scrollLeftStore?.subscribe) return;

    const handleScrollLeft = (value) => {
      const left = value ?? 0;
      scrollLeftRef.current = left;
      if (isUserScrollRef.current) {
        isUserScrollRef.current = false;
        return;
      }
      syncHorizontalScroll(left);
    };

    const unsubscribe = scrollLeftStore.subscribe(handleScrollLeft);
    const currentLeft = api.getState?.().scrollLeft;
    if (currentLeft !== undefined) handleScrollLeft(currentLeft);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      else unsubscribe?.unsubscribe?.();
    };
  }, [api, syncHorizontalScroll]);

  // FIXME - temporary hack to provide fresh values to grid's handlers
  const handlersStateRef = useRef(null);
  const setHandlersState = () => {
    handlersStateRef.current = {
      api,
      rResourceSort,
      syncHorizontalScroll,
    };
  };
  setHandlersState();
  useEffect(() => {
    setHandlersState();
  }, [api, rResourceSort, syncHorizontalScroll]);

  // track container/grid sizes (offsetWidth / clientWidth / clientHeight)
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (containerRef.current)
        setContainerWidth(containerRef.current.offsetWidth);
      if (gridContainerRef.current)
        setGridClientWidth(gridContainerRef.current.clientWidth);
      if (scaleContainerRef.current)
        setRightContainerHeight(scaleContainerRef.current.clientHeight);
    });
    if (containerRef.current) ro.observe(containerRef.current);
    if (gridContainerRef.current) ro.observe(gridContainerRef.current);
    if (scaleContainerRef.current) ro.observe(scaleContainerRef.current);
    // initial read
    if (containerRef.current)
      setContainerWidth(containerRef.current.offsetWidth);
    if (gridContainerRef.current)
      setGridClientWidth(gridContainerRef.current.clientWidth);
    if (scaleContainerRef.current)
      setRightContainerHeight(scaleContainerRef.current.clientHeight);
    return () => ro.disconnect();
  }, []);

  function onClick(ev) {
    const action = ev.target.dataset.action;
    if (action === 'open-resource-row') {
      ev.preventDefault();
      const id = locateID(ev);
      const task = rResources.find((a) => a.id === id);
      if (task.data) api.exec(action, { id, mode: !task.open });
    }
  }

  const initLeft = useCallback((lapi) => {
    leftApiRef.current = lapi;
    lapi.on('select-row', (ev) => {
      setSelectedRows((prev) => (prev[0] === ev.id ? prev : [ev.id]));
    });
    lapi.intercept('sort-rows', (ev) => {
      const { key, add } = ev;
      const { api, rResourceSort } = handlersStateRef.current;
      const keySort = rResourceSort
        ? rResourceSort.find((s) => s.key === key)
        : null;
      let order = 'asc';
      if (keySort) order = !keySort || keySort.order === 'asc' ? 'desc' : 'asc';

      api.exec('sort-resources', {
        key,
        order,
        add,
        _columns: finalColumnsRef.current,
      });
      return false;
    });

    lapi.intercept('resize-column', (ev) => {
      ev.flexgrowFallback = getFillColumn(finalColumnsRef.current, ev.id);
    });

    lapi.on('resize-column', () => {
      setColumnWidth(getColumnsWidth(lapi.getState().columns));
    });

    lapi.on('scroll-to', (ev) => {
      if (ev.top !== undefined && !ev.rSync)
        rightApiRef.current?.exec('scroll-to', {
          top: ev.top,
          rSync: true,
        });
    });
  }, []);

  const initRight = useCallback((rapi) => {
    rightApiRef.current = rapi;
    handlersStateRef.current.syncHorizontalScroll(expectedScrollLeftRef.current);

    rapi.on('select-row', (ev) => {
      setSelectedRows((prev) => (prev[0] === ev.id ? prev : [ev.id]));
    });

    rapi.on('scroll-to', (ev) => {
      if (
        ev.left !== undefined &&
        !ev.rSync &&
        Math.abs(ev.left - expectedScrollLeftRef.current) > 1
      ) {
        expectedScrollLeftRef.current = ev.left;
        scrollLeftRef.current = ev.left;
        isUserScrollRef.current = true;
        if (
          scalesDiv.current &&
          Math.abs(scalesDiv.current.scrollLeft - ev.left) > 1
        )
          scalesDiv.current.scrollLeft = ev.left;
        handlersStateRef.current.api.exec('scroll-chart', { left: ev.left });
      }
      if (ev.top !== undefined && !ev.rSync)
        leftApiRef.current?.exec('scroll-to', {
          top: ev.top,
          rSync: true,
        });
    });
  }, []);

  function getCellStyle(row, col) {
    const value = getValue(row, col);
    if (value) {
      return value.percent > 100 ? ' wx-overload' : ' wx-normal';
    }

    if (col.unit !== 'day' && col.unit !== 'hour') return '';

    const resourceCalendar = api.getResourceCalendar(row);
    if (resourceCalendar) {
      const isWorkingDay = resourceCalendar.isWorkingDay(col.date);
      if (!isWorkingDay) return resourceCalendar.css ?? 'wx-weekend';
    } else if (highlightTime) return highlightTime(col.date, col.unit);

    return '';
  }

  const onWheel = useMemo(
    () =>
      api
        ? createZoomWheelHandler(
            api,
            () => zoomRef.current,
            () => chartContainerRef.current,
          )
        : null,
    [api],
  );

  // attach wheel manually: React's onWheel prop is passive and can't preventDefault
  useEffect(() => {
    const node = chartContainerRef.current;
    if (!node || !onWheel) return;
    node.addEventListener('wheel', onWheel);
    return () => node.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  if (!api) return null;

  return (
    <div
      className="wx-resource-load wx-aacPnv3E"
      style={{ '--wx-scrollbar-width': `${scrollbarWidth}px` }}
      ref={containerRef}
      data-menu-ignore="true"
    >
      <div className="wx-layout wx-aacPnv3E">
        {columns && columns.length ? (
          <>
            <div
              className={[
                'wx-grid-container',
                'wx-aacPnv3E',
                rightHasVScroll ? 'wx-y-scroll' : '',
                rightHasHScroll && !leftHasHScroll ? 'wx-h-scroll-reserve' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ flex: `0 0 ${flexBasis}` }}
              ref={gridContainerRef}
            >
              <div className="wx-y-bar-clip wx-aacPnv3E">
                <div
                  className="wx-resource-grid wx-aacPnv3E"
                  onClick={onClick}
                >
                  <Grid
                    init={initLeft}
                    sizes={{
                      rowHeight: cellHeight,
                      headerHeight: rScales ? rScales.height / headerLength : 0,
                    }}
                    columnStyle={(col) => `wx-text-${col.align}`}
                    data={rResources || []}
                    columns={fitColumns}
                    sortMarks={sortMarks}
                    selectedRows={selectedRows}
                  />
                </div>
              </div>
            </div>

            <Resizer containerWidth={containerWidth} api={api} />
          </>
        ) : null}

        <div className="wx-chart wx-aacPnv3E" ref={chartContainerRef}>
          <div
            className={[
              'wx-timescale-viewport',
              'wx-aacPnv3E',
              rightHasVScroll ? 'wx-v-scroll-reserve' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            ref={scalesDiv}
          >
            <TimeScales api={api} />
          </div>
          {mode === 'grid' ? (
            <div
              className="wx-grid-scale-container wx-aacPnv3E"
              ref={scaleContainerRef}
            >
              <Grid
                init={initRight}
                columns={rightColumns}
                data={rResources || []}
                sizes={{
                  rowHeight: cellHeight,
                  headerHeight: 0,
                }}
                selectedRows={selectedRows}
                rowStyle={() =>
                  cellBorders === 'column' ? 'wx-column-border' : ''
                }
                cellStyle={getCellStyle}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ResourceLoad;
