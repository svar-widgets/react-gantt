import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { context } from '@svar-ui/react-core';
import { locateID } from '@svar-ui/lib-dom';
import { reorder } from '../../helpers/reorder';
import { prepareEditTask } from '@svar-ui/gantt-store';
import { Grid as WxGrid } from '@svar-ui/react-grid';
import TextCell from './TextCell.jsx';
import ActionCell from './ActionCell.jsx';
import { useWritableProp, useStore } from '@svar-ui/lib-react';
import storeContext from '../../context';
import './Grid.css';

export default function Grid(props) {
  const {
    readonly,
    compactMode,
    width = 0,
    display = 'all',
    columnWidth: columnWidthProp = 0,
    onTableAPIChange,
  } = props;
  const [columnWidth, setColumnWidthProp] = useWritableProp(columnWidthProp);
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
  const headerLengthVal = useStore(api, '_headerLength');
  const columnsVal = useStore(api, 'columns');
  const sortVal = useStore(api, '_sort');
  const calendarVal = useStore(api, 'calendar');
  const durationUnitVal = useStore(api, 'durationUnit');
  const splitTasksVal = useStore(api, 'splitTasks');
  const filterValuesVal = useStore(api, 'filterValues');

  const [dragTask, setDragTask] = useState(null);

  const tasks = useMemo(() => {
    if (!rTasksVal || !areaVal) return [];
    return rTasksVal.slice(areaVal.start, areaVal.end);
  }, [rTasksVal, areaVal]);

  const execAction = useCallback(
    (id, action) => {
      if (action === 'add-task') {
        api.exec(action, {
          target: id,
          task: { text: _('New Task') },
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
    [tasks],
  );

  const onClick = useCallback(
    (e) => {
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
            focus: 'grid',
          });
        }
      } else if (action === 'add-task') {
        execAction(null, action);
      }
    },
    [api, execAction],
  );

  const tableRef = useRef(null);
  const tableContainerRef = useRef(null);
  const [gridWidth, setGridWidth] = useState(0);
  const [gridHeight, setGridHeight] = useState(0);
  const [updateFlex, setUpdateFlex] = useState(false);

  useEffect(() => {
    const node = tableContainerRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const update = () => {
      setGridWidth(node.clientWidth);
      setGridHeight(node.clientHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const allTasks = useMemo(() => {
    const rows =
      dragTask && !tasks.find((t) => t.id === dragTask.id)
        ? [...tasks, dragTask]
        : tasks;
    return rows.map((t) => ({ ...t }));
  }, [tasks, dragTask]);

  const allTasksRef = useRef(allTasks);
  useEffect(() => {
    allTasksRef.current = allTasks;
  }, [allTasks]);

  const lastDetailRef = useRef(null);

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
          } else if (task && task.data && task.open) {
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
    let cols = (columnsVal || []).map((col) => {
      col = { ...col };
      const header = [...col.header];
      header.forEach((line) => {
        if (line.text) line.text = _(line.text);
      });
      col.header = header;
      return col;
    });
    const ti = cols.findIndex((c) => c.id === 'text');
    const ai = cols.findIndex((c) => c.id === 'add-task');

    if (ti !== -1) {
      if (cols[ti].cell) cols[ti]._cell = cols[ti].cell;
      cols[ti].cell = TextCell;
    }
    if (ai !== -1) {
      cols[ai].cell = cols[ai].cell || ActionCell;
      const header = cols[ai].header[0];
      cols[ai].header[0].cell = header.cell || ActionCell;

      if (readonly) {
        cols.splice(ai, 1);
      } else {
        if (compactMode) {
          const [actionCol] = cols.splice(ai, 1);
          cols.unshift(actionCol);
        }
      }
    }

    if (cols.length > 0) cols[cols.length - 1].resize = false;
    return cols;
  }, [columnsVal, _, readonly, compactMode]);

  // SIZES
  // --------

  const scrollDelta = useMemo(() => areaVal?.from ?? 0, [areaVal]);
  const headerHeight = useMemo(() => scalesVal?.height ?? 0, [scalesVal]);

  const scrollX = useMemo(() => {
    if (!compactMode && display !== 'grid') {
      return (columnWidth ?? 0) > (width ?? 0);
    } else {
      return (columnWidth ?? 0) > (gridWidth ?? 0);
    }
  }, [compactMode, display, columnWidth, width, gridWidth]);

  const tableStyle = useMemo(() => {
    const style = {
      minHeight: `${gridHeight + (cellHeightVal ?? 0) * 4}px`,
    };
    if ((scrollX && display === 'all') || (display === 'grid' && scrollX)) {
      style.width = columnWidth;
    } else if (display === 'grid') {
      style.width = '100%';
    }
    return style;
  }, [scrollX, display, columnWidth, gridHeight, cellHeightVal]);

  const basis = useMemo(() => {
    if (display === 'all') return `${width}px`;
    if (display === 'grid') return 'calc(100% - 4px)';
    return cols.find((c) => c.id === 'add-task') ? '50px' : '0';
  }, [display, width, cols]);

  const sortMarks = useMemo(() => {
    if (allTasks && sortVal?.length) {
      const marks = {};
      sortVal.forEach(({ key, order }, index) => {
        marks[key] = {
          order,
          ...(sortVal.length > 1 && { index }),
        };
      });
      return marks;
    }
    return {};
  }, [allTasks, sortVal]);

  const filters = useMemo(() => {
    return sortMarks ? { ...filterValuesVal } : filterValuesVal;
  }, [sortMarks, filterValuesVal]);

  const checkFlex = useCallback(() => {
    return cols.some((c) => c.flexgrow && !c.hidden);
  }, [cols]);

  const hasFlexCol = useMemo(() => {
    // updateFlex is used to trigger re-evaluation
    void updateFlex;
    return checkFlex();
  }, [checkFlex, updateFlex]);

  const fitColumns = useMemo(() => {
    let filteredColumns =
      display === 'chart' ? cols.filter((c) => c.id === 'add-task') : cols;

    const containerWidth = display === 'all' ? width : gridWidth;
    if (!hasFlexCol) {
      let baseColumnWidth = columnWidth;
      let forceReset = false;
      if (cols.some((c) => c.$width)) {
        let actualWidth = 0;
        baseColumnWidth = cols.reduce((acc, col) => {
          if (!col.hidden) {
            actualWidth += col.width;
            acc += col.$width || col.width;
          }
          return acc;
        }, 0);

        if (actualWidth > baseColumnWidth && baseColumnWidth >= containerWidth)
          forceReset = true;
      }

      if (forceReset || baseColumnWidth < containerWidth) {
        let k = 1;
        if (!forceReset)
          k = (containerWidth - 50) / (baseColumnWidth - 50 || 1);
        return filteredColumns.map((c) => {
          if (c.id !== 'add-task' && !c.hidden) {
            if (!c.$width) c.$width = c.width;
            c.width = c.$width * k;
          }
          return c;
        });
      }
    }
    return filteredColumns;
  }, [display, cols, hasFlexCol, columnWidth, width, gridWidth]);

  const setColumnWidth = useCallback(
    (resized) => {
      if (!checkFlex()) {
        const newColumnWidth = fitColumns.reduce((acc, col) => {
          if (resized && col.$width) col.$width = col.width;
          return acc + (col.hidden ? 0 : col.width);
        }, 0);
        if (newColumnWidth !== columnWidth) setColumnWidthProp(newColumnWidth);
      }
      setUpdateFlex(true);
      setUpdateFlex(false);
    },
    [checkFlex, fitColumns, columnWidth, setColumnWidthProp],
  );

  const adjustColumns = useCallback(() => {
    const flexCols = cols.filter((c) => c.flexgrow && !c.hidden);
    if (flexCols.length === 1)
      cols.forEach((c) => {
        if (c.$width && !c.flexgrow && !c.hidden) c.width = c.$width;
      });
  }, [cols]);

  const onDblClick = useCallback(
    (e) => {
      if (!readonly) {
        const id = locateID(e);
        const column = locateID(e, 'data-col-id');
        const columnObj = column && cols.find((c) => c.id === column);
        if (!columnObj?.editor && id) api.exec('show-editor', { id });
      }
    },
    [api, readonly, cols],
  );

  const sel = useMemo(
    () => (Array.isArray(selectedVal) ? selectedVal.map((o) => o.id) : []),
    [selectedVal],
  );

  const setScrollOffset = useCallback(() => {
    if (tableRef.current && allTasks !== null) {
      const body = tableRef.current.querySelector('.wx-body');
      if (body)
        body.style.top = -((scrollTopVal ?? 0) - (scrollDelta ?? 0)) + 'px';
    }
  }, [allTasks, scrollTopVal, scrollDelta]);

  useEffect(() => {
    if (tableRef.current) {
      setScrollOffset();
    }
  }, [scrollTopVal, scrollDelta, setScrollOffset]);

  useEffect(() => {
    const tableEl = tableRef.current;
    if (!tableEl) return;
    const bodyEl = tableEl.querySelector('.wx-table-box .wx-body');
    if (!bodyEl || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      setScrollOffset();
    });
    ro.observe(bodyEl);
    return () => {
      ro.disconnect();
    };
  }, [fitColumns, tableStyle, display, basis, allTasks, setScrollOffset]);

  const pendingFocusRef = useRef(false);
  useEffect(() => {
    if (!focusTask || !tableAPI) return;

    const { id, column } = focusTask;
    if (column) {
      if (!pendingFocusRef.current) {
        pendingFocusRef.current = true;
        requestAnimationFrame(() => {
          const focusCell = tableAPI.getState().focusCell;
          tableAPI.exec('focus-cell', {
            row: id,
            column: focusCell?.column || cols[0]?.id,
          });
          pendingFocusRef.current = false;
        });
      }
    }
  }, [focusTask, tableAPI]);

  const startReorder = useCallback(
    ({ id }) => {
      if (readonly) return false;

      if (api.getTask(id).open) api.exec('open-task', { id, mode: false });

      const t = api.getState()._tasks.find((t) => t.id === id);
      setDragTask(t || null);
      if (!t) return false;
    },
    [api, readonly],
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

  const handleHotkey = useCallback(
    (ev) => {
      const { key, isInput } = ev;
      if (!isInput && (key === 'arrowup' || key === 'arrowdown')) {
        ev.eventSource = 'grid';
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
    [api, execAction, tableAPI],
  );

  // FIXME - temporary hack to provide fresh values to grid's handlers
  const handlersStateRef = useRef(null);
  const setHandlersState = () => {
    handlersStateRef.current = {
      setTableAPI,
      handleHotkey,
      sortVal,
      api,
      adjustColumns,
      setColumnWidth,
      tasks,
      calendarVal,
      durationUnitVal,
      splitTasksVal,
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
    adjustColumns,
    setColumnWidth,
    tasks,
    calendarVal,
    durationUnitVal,
    splitTasksVal,
    onTableAPIChange,
  ]);

  const init = useCallback((tapi) => {
    setTableAPI(tapi);
    tapi.intercept('hotkey', (ev) => handlersStateRef.current.handleHotkey(ev));
    tapi.intercept('scroll', () => false);
    tapi.intercept('select-row', () => false);
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

    tapi.on('resize-column', () => {
      handlersStateRef.current.setColumnWidth(true);
    });

    tapi.on('hide-column', (ev) => {
      if (!ev.mode) handlersStateRef.current.adjustColumns();
      handlersStateRef.current.setColumnWidth();
    });

    tapi.intercept('update-cell', (e) => {
      const { id, column, value } = e;
      const task = handlersStateRef.current.tasks.find((t) => t.id === id);

      if (task) {
        const update = { ...task };
        let v = value;
        if (v && !isNaN(v) && !(v instanceof Date)) v *= 1;
        update[column] = v;

        prepareEditTask(
          update,
          {
            calendar: handlersStateRef.current.calendarVal,
            durationUnit: handlersStateRef.current.durationUnitVal,
            splitTasks: handlersStateRef.current.splitTasksVal,
          },
          column,
        );

        api.exec('update-task', {
          id: id,
          task: update,
        });
      }
      return false;
    });

    onTableAPIChange && onTableAPIChange(tapi);
  }, []);

  return (
    <div
      className="wx-rHj6070p wx-table-container"
      style={{ flex: `0 0 ${basis}` }}
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
            headerHeight:
              (headerHeight ?? 0) / (headerLengthVal ?? 1),
          }}
          rowStyle={(row) =>
            row.$reorder ? 'wx-rHj6070p wx-reorder-task' : 'wx-rHj6070p'
          }
          columnStyle={(col) =>
            `wx-rHj6070p wx-text-${col.align}${col.id === 'add-task' ? ' wx-action' : ''}`
          }
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
