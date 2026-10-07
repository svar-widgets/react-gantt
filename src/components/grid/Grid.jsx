import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { context } from '@svar-ui/react-core';
import { locateID } from '@svar-ui/lib-dom';
import { reorder, followReorder } from '../../helpers/reorder';
import {
  prepareEditTask,
  setTaskResources,
  getHeaderLength,
  isPlaceholder,
  getPlaceholderTask,
} from '@svar-ui/gantt-store';
import { Grid as WxGrid } from '@svar-ui/react-grid';
import TextCell from './TextCell.jsx';
import ActionCell from './ActionCell.jsx';
import ResourcesCell from './ResourcesCell.jsx';
import EditorResourcesCell from './EditorResourcesCell.jsx';
import {
  getGridMinHeight,
  getGridStyle,
  getFlexBasis,
  getScrollX,
  getFitColumns,
  getFillColumn,
  getColumnsWidth,
  getSortMarks,
  getColumnStyle,
} from '../../helpers/grid';
import { useStore } from '@svar-ui/lib-react';
import storeContext from '../../context';
import './Grid.css';

function cssTextToStyle(cssText) {
  const style = {};
  cssText.split(';').forEach((decl) => {
    const idx = decl.indexOf(':');
    if (idx === -1) return;
    const prop = decl.slice(0, idx).trim();
    const value = decl.slice(idx + 1).trim();
    if (!prop) return;
    const key = prop.startsWith('--')
      ? prop
      : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    style[key] = value;
  });
  return style;
}

export default function Grid(props) {
  const { readonly, section = 'grid', onTableAPIChange } = props;
  const isSubGrid = section === 'subGrid';
  const [columnWidth, setColumnWidth] = useState(0);
  const [tableAPI, setTableAPI] = useState();

  const i18n = useContext(context.i18n);
  const _ = useMemo(() => i18n.getGroup('gantt'), [i18n]);
  const api = useContext(storeContext);

  const scrollTopVal = useStore(api, 'scrollTop');
  const cellHeightVal = useStore(api, 'cellHeight');
  const focusTask = useStore(api, 'focusTask');
  const selectedVal = useStore(api, '_selected');
  const areaVal = useStore(api, 'area');
  const rTasksVal = useStore(api, '_tasks');
  const scalesVal = useStore(api, '_scales');
  const columnsVal = useStore(api, '_columns');
  const sortVal = useStore(api, '_sort');
  const durationUnitVal = useStore(api, 'durationUnit');
  const inclusiveEndVal = useStore(api, 'inclusiveEnd');
  const splitTasksVal = useStore(api, 'splitTasks');
  const unscheduledTasksVal = useStore(api, 'unscheduledTasks');
  const inactiveTasksVal = useStore(api, 'inactiveTasks');
  const filterValuesVal = useStore(api, 'filterValues');
  const groupByVal = useStore(api, 'groupBy');
  const gridWidthVal = useStore(api, 'gridWidth');
  const subGridWidthVal = useStore(api, 'subGridWidth');
  const displayPanelsVal = useStore(api, '_displayPanels');
  const compactModeVal = useStore(api, '_compactMode');
  const columnsWidthVal = useStore(api, '_columnsWidth');

  const panelWidth = isSubGrid ? subGridWidthVal : gridWidthVal;
  const fillRemaining = useMemo(
    () => isSubGrid && !(displayPanelsVal || []).includes('chart'),
    [isSubGrid, displayPanelsVal],
  );

  const [dragTask, setDragTask] = useState(null);

  const tasks = useMemo(() => {
    if (!rTasksVal || !areaVal) return [];
    return rTasksVal.slice(areaVal.start, areaVal.end);
  }, [rTasksVal, areaVal]);

  const execAction = useCallback(
    (id, action) => {
      // no task behind the placeholder to target
      if (isPlaceholder(id)) return;
      if (action === 'add-task') {
        api.exec(action, {
          target: id,
          task: { text: _('New task') },
          mode: 'child',
          show: true,
          focus: id ? 'grid' : null,
        });
      } else if (action === 'open-task') {
        const task = tasks.find((a) => a.id === id);
        if (task?.data || task?.lazy)
          api.exec(action, { id, mode: !task.open });
      }
    },
    [api, _, tasks],
  );

  const createPlaceholder = useCallback(
    (task) => {
      const ev = {
        task: getPlaceholderTask(task, _('New task')),
        show: true,
        eventSource: 'placeholder',
      };
      api.exec('add-task', ev);
      return ev.id;
    },
    [api, _],
  );

  const onClick = useCallback(
    (e) => {
      if (e.detail > 1) return;
      const id = locateID(e);
      const action = e.target.dataset.action;
      if (action) e.preventDefault();
      if (id) {
        if (action === 'add-task' || action === 'open-task') {
          execAction(id, action);
        } else {
          api.exec('select-task', {
            id,
            toggle: e.ctrlKey || e.metaKey,
            range: e.shiftKey,
            show: 'xy',
            focus: isSubGrid ? 'subGrid' : 'grid',
          });
        }
      } else if (action === 'add-task') {
        execAction(null, action);
      }
    },
    [api, execAction, isSubGrid],
  );

  const tableRef = useRef(null);
  const tableContainerRef = useRef(null);
  const [gridClientWidth, setGridClientWidth] = useState(0);
  const [gridClientHeight, setGridClientHeight] = useState(0);

  useEffect(() => {
    const node = tableContainerRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const update = () => {
      setGridClientWidth(node.clientWidth);
      setGridClientHeight(node.clientHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const reorderTask = useMemo(
    () => (isSubGrid ? (rTasksVal || []).find((task) => task.$reorder) : null),
    [isSubGrid, rTasksVal],
  );

  const allTasks = useMemo(() => {
    const extra = dragTask || reorderTask;
    const rows =
      extra && !tasks.find((t) => t.id === extra.id)
        ? [...tasks, extra]
        : tasks;
    return rows.map((t) => ({ ...t }));
  }, [tasks, dragTask, reorderTask]);

  const allTasksRef = useRef(allTasks);
  useEffect(() => {
    allTasksRef.current = allTasks;
  }, [allTasks]);

  const lastDetailRef = useRef(null);

  const groupByRef = useRef(groupByVal);
  useEffect(() => {
    groupByRef.current = groupByVal;
  }, [groupByVal]);

  const reorderTasks = useCallback(
    (detail) => {
      const id = detail.id;
      const { before, after } = detail;
      const inProgress = detail.onMove;

      let target = before || after;
      let mode = before ? 'before' : 'after';

      if (inProgress) {
        if (mode === 'after') {
          const index = allTasksRef.current.findIndex((t) => t.id === id);
          const targetIndex = allTasksRef.current.findIndex(
            (t) => t.id === target,
          );
          const task = allTasksRef.current[targetIndex];
          if (index - targetIndex === 1) {
            mode = 'before';
          } else if (
            !groupByRef.current?.field &&
            task &&
            task.data &&
            task.open
          ) {
            mode = 'before';
            target = task.data[0].id;
          }
        }
        lastDetailRef.current = { id, [mode]: target };
      } else lastDetailRef.current = null;

      api.exec('move-task', {
        id,
        mode,
        target,
        inProgress,
      });
    },
    [api],
  );

  // COLUMNS
  // --------

  const cols = useMemo(() => {
    // end-like column getters read the mode: new columns redraw the cells
    // (inclusiveEndVal is a dependency of this memo)
    let cols = (columnsVal || []).map((col) => {
      col = { ...col };
      const header = [...col.header];
      header.forEach((line) => {
        if (line.text) line.text = _(line.text);
      });
      col.header = header;
      // in readonly mode we must disable column inline editors entirely.
      // otherwise grid will open per-cell editors on dblclick.
      col.editor = readonly ? null : col.editor;
      return col;
    });

    const ti = cols.findIndex((c) => c.id === 'text');
    const ai = cols.findIndex((c) => c.id === 'add-task');
    const ri = cols.findIndex((c) => c.id === 'resources');

    if (ti !== -1) {
      if (cols[ti].cell) cols[ti]._cell = cols[ti].cell;
      cols[ti].cell = TextCell;
    }
    if (ri !== -1) {
      const resCol = cols[ri];
      if (!resCol.cell) resCol.cell = ResourcesCell;
      if (resCol.editor && typeof resCol.editor !== 'function') {
        const editor = resCol.editor;
        const config = editor.config;
        if (!config.cell) config.cell = EditorResourcesCell;
        config.cell = EditorResourcesCell;
        if (!config.dropdown) config.dropdown = { width: 'auto' };
        resCol.editor = (row) => {
          if (row.type !== 'summary') return editor;
        };
      }
    }
    if (ai !== -1 && !isSubGrid) {
      cols[ai].cell = cols[ai].cell || ActionCell;
      const header = cols[ai].header[0];
      cols[ai].header[0].cell = header.cell || ActionCell;

      if (readonly) {
        cols.splice(ai, 1);
      } else {
        if (compactModeVal) {
          const [actionCol] = cols.splice(ai, 1);
          cols.unshift(actionCol);
        }
      }
    }

    cols = cols.filter((c) => (c.section || 'grid') === section);
    if (cols.length > 0) cols[cols.length - 1].resize = false;
    return cols;
  }, [columnsVal, _, readonly, compactModeVal, inclusiveEndVal, section]);

  const colsRef = useRef(cols);
  colsRef.current = cols;

  useLayoutEffect(() => {
    setColumnWidth(getColumnsWidth(cols));
  }, [cols]);

  // SIZES
  // --------

  const scrollDelta = useMemo(() => areaVal?.from ?? 0, [areaVal]);
  const headerHeight = useMemo(() => scalesVal?.height ?? 0, [scalesVal]);

  const flexBasis = useMemo(
    () =>
      getFlexBasis(
        columnsVal || [],
        displayPanelsVal,
        panelWidth,
        section,
        fillRemaining,
      ),
    [columnsVal, displayPanelsVal, panelWidth, section, fillRemaining],
  );

  const scrollX = useMemo(
    () =>
      getScrollX(
        compactModeVal,
        displayPanelsVal,
        columnWidth,
        gridClientWidth,
        panelWidth,
        section,
        fillRemaining,
      ),
    [
      compactModeVal,
      displayPanelsVal,
      columnWidth,
      gridClientWidth,
      panelWidth,
      section,
      fillRemaining,
    ],
  );

  const bodyOffset = useMemo(
    () => (scrollDelta ?? 0) - (scrollTopVal ?? 0),
    [scrollDelta, scrollTopVal],
  );

  const tableStyle = useMemo(() => {
    const css =
      getGridMinHeight(gridClientHeight, cellHeightVal ?? 0) +
      getGridStyle(displayPanelsVal, columnWidth, scrollX, section);
    const style = cssTextToStyle(css);
    style['--wx-body-offset'] = `${bodyOffset}px`;
    return style;
  }, [
    gridClientHeight,
    cellHeightVal,
    displayPanelsVal,
    columnWidth,
    scrollX,
    section,
    bodyOffset,
  ]);

  // SELECTION
  // --------
  const sel = useMemo(
    () => (Array.isArray(selectedVal) ? selectedVal.map((o) => o.id) : []),
    [selectedVal],
  );

  const fitColumns = useMemo(
    () =>
      getFitColumns(
        cols,
        displayPanelsVal,
        section,
        'add-task',
        columnsWidthVal,
      ),
    [cols, displayPanelsVal, section, columnsWidthVal],
  );
  const visibleHeaderLength = useMemo(
    () => getHeaderLength(fitColumns),
    [fitColumns],
  );

  const onDblClick = useCallback(
    (e) => {
      if (!readonly) {
        const id = locateID(e);
        if (isPlaceholder(id)) return;
        const column = locateID(e, 'data-col-id');
        const columnObj = column && cols.find((c) => c.id === column);
        if (!columnObj?.editor && id && !isSubGrid)
          api.exec('show-editor', { id });
      }
    },
    [api, readonly, cols, isSubGrid],
  );

  const sortMarks = useMemo(
    () => getSortMarks(allTasks, sortVal),
    [allTasks, sortVal],
  );

  const filters = useMemo(() => {
    return sortMarks ? { ...filterValuesVal } : filterValuesVal;
  }, [sortMarks, filterValuesVal]);

  const focusFrameRef = useRef(0);
  useEffect(() => {
    if (!focusTask || !tableAPI) return;

    const { id, section: focusSection } = focusTask;
    if (focusSection !== (isSubGrid ? 'subGrid' : 'grid')) return;
    if (focusFrameRef.current) return;
    focusFrameRef.current = requestAnimationFrame(() => {
      focusFrameRef.current = 0;
      const { focusCell, editor } = tableAPI.getState();
      if (!editor) {
        tableAPI.exec('focus-cell', {
          row: id,
          column: focusCell?.column || colsRef.current[0]?.id,
        });
      }
    });
  }, [focusTask, tableAPI, isSubGrid]);

  useEffect(() => {
    return () => {
      if (focusFrameRef.current) cancelAnimationFrame(focusFrameRef.current);
      focusFrameRef.current = 0;
    };
  }, []);

  const startReorder = useCallback(
    ({ id }) => {
      if (readonly || isSubGrid) return false;
      if (groupByRef.current?.field) {
        const task = api.getTask(id);
        if (task.$group || task.data) return false;
      }

      if (api.getTask(id).open) api.exec('open-task', { id, mode: false });

      const t = api.getState()._tasks.find((t) => t.id === id);
      setDragTask(t || null);
      if (!t) return false;
    },
    [api, readonly, isSubGrid],
  );

  const endReorder = useCallback(
    ({ id, top }) => {
      if (lastDetailRef.current) {
        reorderTasks({ ...lastDetailRef.current, onMove: false });
      } else {
        api.exec('drag-task', {
          id,
          top: top + (scrollDelta ?? 0),
          inProgress: false,
        });
      }
      setDragTask(null);
    },
    [api, reorderTasks, scrollDelta],
  );

  const moveReorder = useCallback(
    ({ id, top, detail }) => {
      if (detail) {
        reorderTasks({ ...detail, onMove: true });
      }
      api.exec('drag-task', {
        id,
        top: top + (scrollDelta ?? 0),
        inProgress: true,
      });
    },
    [api, reorderTasks, scrollDelta],
  );

  useEffect(() => {
    const node = tableRef.current;
    if (!node) return;
    const action = reorder(node, {
      start: startReorder,
      end: endReorder,
      move: moveReorder,
      getTask: api.getTask,
    });
    return action.destroy;
  }, [api, startReorder, endReorder, moveReorder]);

  useEffect(() => {
    const node = tableRef.current;
    if (!node || !isSubGrid) return;
    const action = followReorder(node, { api });
    return action.destroy;
  }, [api, isSubGrid]);

  const handleHotkey = useCallback(
    (ev) => {
      const { key, isInput } = ev;
      if (!isInput && (key === 'arrowup' || key === 'arrowdown')) {
        ev.eventSource = isSubGrid ? 'subGrid' : 'grid';
        api.exec('hotkey', ev);
        return false;
      } else if (key === 'enter') {
        const focusCell = tableAPI?.getState().focusCell;
        if (focusCell) {
          const { row, column } = focusCell;
          if (column === 'add-task') {
            execAction(row, 'add-task');
          } else if (column === 'text') {
            execAction(row, 'open-task');
          }
        }
      }
    },
    [api, execAction, tableAPI, isSubGrid],
  );

  // FIXME - temporary hack to provide fresh values to grid's handlers
  const handlersStateRef = useRef(null);
  const setHandlersState = () => {
    handlersStateRef.current = {
      setTableAPI,
      handleHotkey,
      sortVal,
      api,
      cols,
      setColumnWidth,
      tasks,
      columnsVal,
      durationUnitVal,
      splitTasksVal,
      unscheduledTasksVal,
      createPlaceholder,
      onTableAPIChange,
    };
  };
  setHandlersState();
  useEffect(() => {
    setHandlersState();
  }, [
    setTableAPI,
    handleHotkey,
    sortVal,
    api,
    cols,
    setColumnWidth,
    tasks,
    columnsVal,
    durationUnitVal,
    splitTasksVal,
    unscheduledTasksVal,
    createPlaceholder,
    onTableAPIChange,
  ]);

  // expose the table API while mounted, reset it on unmount
  const tableAPIRef = useRef(null);
  useEffect(() => {
    const { onTableAPIChange } = handlersStateRef.current;
    if (tableAPIRef.current && onTableAPIChange)
      onTableAPIChange(tableAPIRef.current);
    return () => {
      const { onTableAPIChange } = handlersStateRef.current;
      if (onTableAPIChange) onTableAPIChange(null);
    };
  }, []);

  const init = useCallback((tapi) => {
    tableAPIRef.current = tapi;
    setTableAPI(tapi);
    tapi.intercept('hotkey', (ev) => handlersStateRef.current.handleHotkey(ev));
    tapi.intercept('select-row', () => false);
    tapi.intercept('scroll', () => false);
    tapi.intercept('sort-rows', (e) => {
      const sortVal = handlersStateRef.current.sortVal;
      const { key, add } = e;
      const keySort = sortVal ? sortVal.find((s) => s.key === key) : null;
      let order = 'asc';
      if (keySort) order = !keySort || keySort.order === 'asc' ? 'desc' : 'asc';

      api.exec('sort-tasks', {
        key,
        order,
        add,
      });
      return false;
    });
    tapi.intercept('filter-rows', (ev) => {
      const { key, value } = ev;

      api.exec('filter-tasks', {
        key,
        value,
        open: true,
      });
      return false;
    });

    tapi.intercept('resize-column', (ev) => {
      ev.flexgrowFallback = getFillColumn(handlersStateRef.current.cols, ev.id);
    });

    tapi.on('resize-column', (ev) => {
      const columns = tapi.getState().columns;
      handlersStateRef.current.setColumnWidth(getColumnsWidth(columns));
      if (ev.inProgress !== true) api.exec('set-columns', { columns });
    });

    tapi.on('hide-column', () => {
      const columns = tapi.getState().columns;
      handlersStateRef.current.setColumnWidth(getColumnsWidth(columns));
      api.exec('set-columns', { columns });
    });

    tapi.intercept('update-cell', (e) => {
      const { id, column, value } = e;
      const task = handlersStateRef.current.tasks.find((t) => t.id === id);

      if (task) {
        const { createPlaceholder } = handlersStateRef.current;
        if (column === 'resources') {
          if (task.$placeholder) {
            const history = api.getHistory();
            if (history) history.startBatch();
            const newId = createPlaceholder(task);
            if (newId) setTaskResources(newId, value, api);
            if (history) history.endBatch();
          } else setTaskResources(id, value, api);
          return;
        }

        let v = value;
        if (typeof v !== 'boolean' && v && !isNaN(v) && !(v instanceof Date))
          v *= 1;
        const update = { ...task };
        const col = (handlersStateRef.current.columnsVal || []).find(
          (c) => c.id === column,
        );
        if (col?.setter) col.setter(update, v);
        else update[column] = v;

        prepareEditTask(
          update,
          {
            durationUnit: handlersStateRef.current.durationUnitVal,
            splitTasks: handlersStateRef.current.splitTasksVal,
            unscheduledTasks: handlersStateRef.current.unscheduledTasksVal,
          },
          api.getTaskCalendar(update),
          column,
        );

        if (task.$placeholder) {
          createPlaceholder(update);
        } else {
          api.exec('update-task', {
            id: id,
            task: update,
          });
        }
      }
      return false;
    });

    onTableAPIChange && onTableAPIChange(tapi);
  }, []);

  return (
    <div
      className={
        'wx-rHj6070p wx-table-container' +
        (isSubGrid ? ' wx-table-container-subgrid' : '')
      }
      data-gantt-section={section}
      style={{
        flex: `${fillRemaining ? '1 1' : '0 0'} ${flexBasis}`,
        minWidth: 0,
      }}
      ref={tableContainerRef}
    >
      <div
        ref={tableRef}
        style={tableStyle}
        className="wx-rHj6070p wx-table"
        onClick={onClick}
        onDoubleClick={onDblClick}
      >
        <WxGrid
          init={init}
          sizes={{
            rowHeight: cellHeightVal,
            headerHeight: (headerHeight ?? 0) / (visibleHeaderLength || 1),
          }}
          rowStyle={(row) => {
            let style = row.$placeholder
              ? 'wx-placeholder-row'
              : row.$reorder
                ? 'wx-reorder-task'
                : '';
            if (inactiveTasksVal && row.inactive)
              style += (style ? ' ' : '') + 'wx-inactive-row';
            return 'wx-rHj6070p' + (style ? ' ' + style : '');
          }}
          columnStyle={getColumnStyle}
          data={allTasks}
          columns={fitColumns}
          selectedRows={[...sel]}
          sortMarks={sortMarks}
          filterValues={filters}
        />
      </div>
    </div>
  );
}
