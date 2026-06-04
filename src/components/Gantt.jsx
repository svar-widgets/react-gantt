import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useImperativeHandle,
  useState,
  useContext,
  useCallback,
} from 'react';

// core widgets lib
import { context } from '@svar-ui/react-core';

// locales
import { locale as l } from '@svar-ui/lib-dom';
import { en } from '@svar-ui/gantt-locales';
import { en as coreEn } from '@svar-ui/core-locales';

// stores
import { EventBusRouter } from '@svar-ui/lib-state';
import {
  DataStore,
  getDefaultColumns,
  defaultTaskTypes,
  normalizeZoom,
} from '@svar-ui/gantt-store';

// context
import StoreContext from '../context';

// store factory
import { writable } from '@svar-ui/lib-react';

// ui
import Layout from './Layout.jsx';

// helpers
import {
  prepareScales,
  prepareFormats,
  prepareColumns,
  prepareZoom,
} from '../helpers/prepareConfig.js';

const camelize = (s) =>
  s
    .split('-')
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ''))
    .join('');

const defaultScales = [
  { unit: 'month', step: 1, format: '%F %Y' },
  { unit: 'day', step: 1, format: '%j' },
];

const EMPTY_ARRAY = [];
const DEFAULT_SCHEDULE = { type: 'forward' };
const ROLLUPS_CLOSEST = { type: 'closest' };

const COMPACT_WIDTH = 650;

const Gantt = forwardRef(function Gantt(
  {
    taskTemplate = null,
    markers = EMPTY_ARRAY,
    taskTypes = defaultTaskTypes,
    tasks = EMPTY_ARRAY,
    selected = EMPTY_ARRAY,
    activeTask = null,
    links = EMPTY_ARRAY,
    resources = null,
    assignments = EMPTY_ARRAY,
    scales = defaultScales,
    columns = null,
    start = null,
    end = null,
    lengthUnit = 'day',
    durationUnit = 'day',
    cellWidth = 100,
    cellHeight = 38,
    scaleHeight = 36,
    gridWidth = 440,
    displayMode = 'all',
    readonly = false,
    cellBorders = 'full',
    zoom = false,
    baselines = false,
    rollups = false,
    highlightTime = null,
    init = null,
    autoScale = true,
    unscheduledTasks = false,
    criticalPath = null,
    schedule = DEFAULT_SCHEDULE,
    projectStart = null,
    projectEnd = null,
    calendar = null,
    calendars = EMPTY_ARRAY,
    undo = false,
    splitTasks = false,
    summary = null,
    slack = false,
    groupBy = null,
    wbs = false,
    ...restProps
  },
  ref,
) {
  // keep latest rest props for event routing
  const restPropsRef = useRef();
  restPropsRef.current = restProps;

  // init stores
  const dataStore = useMemo(() => new DataStore(writable), []);

  // locale and formats
  // uses same logic as the Locale component
  const words = useMemo(() => ({ ...coreEn, ...en }), []);
  const i18nCtx = useContext(context.i18n);
  const locale = useMemo(() => {
    if (!i18nCtx) return l(words);
    return i18nCtx.extend(words, true);
  }, [i18nCtx, words]);

  // prepare configuration objects
  const lCalendar = useMemo(() => locale.getRaw().calendar, [locale]);

  const normalizedConfig = useMemo(() => {
    let config = {
      zoom: prepareZoom(zoom, lCalendar),
      scales: prepareScales(scales, lCalendar),
      columns: prepareColumns(
        columns ?? getDefaultColumns({ resources: !!resources, wbs }),
        lCalendar,
      ),
      links,
      cellWidth,
    };
    if (config.zoom) {
      config = {
        ...config,
        ...normalizeZoom(
          config.zoom,
          prepareFormats(lCalendar, locale.getGroup('gantt')),
          config.scales,
          cellWidth,
        ),
      };
    }
    return config;
  }, [zoom, scales, columns, resources, wbs, links, cellWidth, lCalendar, locale]);

  const firstInRoute = useMemo(() => dataStore.in, [dataStore]);

  const lastInRouteRef = useRef(null);
  if (lastInRouteRef.current === null) {
    lastInRouteRef.current = new EventBusRouter((a, b) => {
      const name = 'on' + camelize(a);
      if (restPropsRef.current && restPropsRef.current[name]) {
        restPropsRef.current[name](b);
      }
    });
    firstInRoute.setNext(lastInRouteRef.current);
  }

  // two-way binding for tableAPI
  const [tableAPI, setTableAPI] = useState(null);
  const tableAPIRef = useRef(null);
  tableAPIRef.current = tableAPI;

  // compact mode (only changes when width crosses COMPACT_WIDTH)
  const [compactMode, setCompactMode] = useState(false);
  const onGanttWidthChange = useCallback((width) => {
    const next = width != null && width <= COMPACT_WIDTH;
    setCompactMode((prev) => (prev === next ? prev : next));
  }, []);

  // public API
  const api = useMemo(
    () => ({
      getState: dataStore.getState.bind(dataStore),
      getReactiveState: dataStore.getReactive.bind(dataStore),
      getStores: () => ({ data: dataStore }),
      exec: firstInRoute.exec,
      setNext: (ev) => {
        lastInRouteRef.current = lastInRouteRef.current.setNext(ev);
        return lastInRouteRef.current;
      },
      intercept: firstInRoute.intercept.bind(firstInRoute),
      on: firstInRoute.on.bind(firstInRoute),
      detach: firstInRoute.detach.bind(firstInRoute),
      getTask: (id) => dataStore.getTask(id),
      getResource: (id) => dataStore.getResource(id),
      serialize: (config) => dataStore.serialize(config),
      getTable: (waitRender) =>
        waitRender
          ? new Promise((res) => setTimeout(() => res(tableAPIRef.current), 1))
          : tableAPIRef.current,
      getHistory: () => dataStore.getHistory(),
      getCalendar: (id) => dataStore.getCalendar(id),
      getTaskCalendar: (task) => dataStore.getTaskCalendar(task),
      getResourceCalendar: (resource) =>
        dataStore.getResourceCalendar(resource),
      getTaskResources: (id) => dataStore.getTaskResources(id),
      getResourceTasks: (id) => dataStore.getResourceTasks(id),
    }),
    [dataStore, firstInRoute],
  );

  // common API available in components
  const storeApi = useMemo(
    () => ({
      getReactiveState: dataStore.getReactive.bind(dataStore),
      getState: dataStore.getState.bind(dataStore),
      exec: firstInRoute.exec.bind(firstInRoute),
      getTask: dataStore.getTask.bind(dataStore),
      getTaskCalendar: dataStore.getTaskCalendar.bind(dataStore),
      getResourceCalendar: dataStore.getResourceCalendar.bind(dataStore),
      getCalendar: dataStore.getCalendar.bind(dataStore),
      getTaskResources: dataStore.getTaskResources.bind(dataStore),
      getHistory: dataStore.getHistory.bind(dataStore),
    }),
    [dataStore, firstInRoute],
  );

  // expose API via ref
  useImperativeHandle(
    ref,
    () => ({
      ...api,
    }),
    [api],
  );

  const rollupsConfig = useMemo(
    () => (rollups === true ? ROLLUPS_CLOSEST : rollups),
    [rollups],
  );

  const storeConfig = useMemo(
    () => ({
      tasks,
      links: normalizedConfig.links,
      resources,
      assignments,
      start,
      columns: normalizedConfig.columns,
      end,
      lengthUnit,
      cellWidth: normalizedConfig.cellWidth,
      cellHeight,
      scaleHeight,
      scales: normalizedConfig.scales,
      taskTypes,
      zoom: normalizedConfig.zoom,
      selected,
      activeTask,
      baselines,
      rollups: rollupsConfig,
      autoScale,
      unscheduledTasks,
      markers,
      durationUnit,
      criticalPath,
      schedule,
      projectStart,
      projectEnd,
      calendar,
      calendars,
      slack,
      undo,
      _weekStart: lCalendar.weekStart,
      splitTasks,
      summary,
      groupBy,
      highlightTime,
      wbs,
      displayMode,
      gridWidth,
      cellBorders,
      _compactMode: compactMode,
    }),
    [
      tasks,
      normalizedConfig,
      resources,
      assignments,
      start,
      end,
      lengthUnit,
      cellHeight,
      scaleHeight,
      taskTypes,
      selected,
      activeTask,
      baselines,
      rollupsConfig,
      autoScale,
      unscheduledTasks,
      markers,
      durationUnit,
      criticalPath,
      schedule,
      projectStart,
      projectEnd,
      calendar,
      calendars,
      slack,
      undo,
      lCalendar,
      splitTasks,
      summary,
      groupBy,
      highlightTime,
      wbs,
      displayMode,
      gridWidth,
      cellBorders,
      compactMode,
    ],
  );

  const initOnceRef = useRef(0);
  useEffect(() => {
    if (!initOnceRef.current) {
      if (init) init(api);
    } else {
      dataStore.init(storeConfig);
    }
    initOnceRef.current++;
  }, [api, init, storeConfig, dataStore]);

  if (initOnceRef.current === 0) {
    dataStore.init(storeConfig);
  }

  return (
    <context.i18n.Provider value={locale}>
      <StoreContext.Provider value={storeApi}>
        <Layout
          taskTemplate={taskTemplate}
          readonly={readonly}
          onTableAPIChange={setTableAPI}
          onGanttWidthChange={onGanttWidthChange}
        />
      </StoreContext.Provider>
    </context.i18n.Provider>
  );
});

export default Gantt;
