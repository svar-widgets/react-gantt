import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useImperativeHandle,
  useState,
  useContext,
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
  defaultColumns,
  defaultTaskTypes,
  parseTaskDates,
  normalizeZoom,
  normalizeLinks,
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

const Gantt = forwardRef(function Gantt(
  {
    taskTemplate = null,
    markers = [],
    taskTypes = defaultTaskTypes,
    tasks = [],
    selected = [],
    activeTask = null,
    links = [],
    scales = defaultScales,
    columns = defaultColumns,
    start = null,
    end = null,
    lengthUnit = 'day',
    durationUnit = 'day',
    cellWidth = 100,
    cellHeight = 38,
    scaleHeight = 36,
    readonly = false,
    cellBorders = 'full',
    zoom = false,
    baselines = false,
    highlightTime: highlightTimeProp = null,
    init = null,
    autoScale = true,
    unscheduledTasks = false,
    criticalPath = null,
    schedule = { type: 'forward' },
    projectStart = null,
    projectEnd = null,
    calendar = null,
    undo = false,
    splitTasks = false,
    summary = null,
    _export = false,
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
      columns: prepareColumns(columns, lCalendar),
      links: normalizeLinks(links),
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
  }, [zoom, scales, columns, links, cellWidth, lCalendar, locale]);

  // parse task dates effect
  const parsedTasksRef = useRef(null);
  if (parsedTasksRef.current !== tasks) {
    if (!_export) {
      parseTaskDates(tasks, { durationUnit, splitTasks, calendar });
    }
    parsedTasksRef.current = tasks;
  }
  useEffect(() => {
    if (!_export) {
      parseTaskDates(tasks, { durationUnit, splitTasks, calendar });
    }
  }, [tasks, durationUnit, calendar, splitTasks, _export]);

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

  // writable prop for two-way binding tableAPI
  const [tableAPI, setTableAPI] = useState(null);
  const tableAPIRef = useRef(null);
  tableAPIRef.current = tableAPI;

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
      getTask: dataStore.getTask.bind(dataStore),
      serialize: () => dataStore.serialize(),
      getTable: (waitRender) =>
        waitRender
          ? new Promise((res) => setTimeout(() => res(tableAPIRef.current), 1))
          : tableAPIRef.current,
      getHistory: () => dataStore.getHistory(),
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

  const initOnceRef = useRef(0);
  useEffect(() => {
    if (!initOnceRef.current) {
      if (init) init(api);
    } else {
      // const prev = dataStore.getState();
      dataStore.init({
        tasks,
        links: normalizedConfig.links,
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
        autoScale,
        unscheduledTasks,
        markers,
        durationUnit,
        criticalPath,
        schedule,
        projectStart,
        projectEnd,
        calendar,
        undo,
        _weekStart: lCalendar.weekStart,
        splitTasks,
        summary,
      });
    }
    initOnceRef.current++;
  }, [
    api,
    init,
    tasks,
    normalizedConfig,
    start,
    end,
    lengthUnit,
    cellHeight,
    scaleHeight,
    taskTypes,
    selected,
    activeTask,
    baselines,
    autoScale,
    unscheduledTasks,
    markers,
    durationUnit,
    criticalPath,
    schedule,
    projectStart,
    projectEnd,
    calendar,
    undo,
    lCalendar,
    splitTasks,
    summary,
    dataStore,
  ]);

  if (initOnceRef.current === 0) {
    dataStore.init({
      tasks,
      links: normalizedConfig.links,
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
      autoScale,
      unscheduledTasks,
      markers,
      durationUnit,
      criticalPath,
      schedule,
      projectStart,
      projectEnd,
      calendar,
      undo,
      _weekStart: lCalendar.weekStart,
      splitTasks,
      summary,
    });
  }

  // highlightTime from calendar
  const highlightTime = useMemo(() => {
    if (calendar) {
      return (day, unit) => {
        if (unit == 'day' && !calendar.getDayHours(day)) return 'wx-weekend';
        if (unit == 'hour' && !calendar.getDayHours(day)) return 'wx-weekend';
        return '';
      };
    }
    return highlightTimeProp;
  }, [calendar, highlightTimeProp]);

  return (
    <context.i18n.Provider value={locale}>
      <StoreContext.Provider value={api}>
        <Layout
          taskTemplate={taskTemplate}
          readonly={readonly}
          cellBorders={cellBorders}
          highlightTime={highlightTime}
          onTableAPIChange={setTableAPI}
        />
      </StoreContext.Provider>
    </context.i18n.Provider>
  );
});

export default Gantt;
