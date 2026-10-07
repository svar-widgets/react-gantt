import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
  useRef,
} from 'react';
import { Editor as WxEditor, registerEditorItem } from '@svar-ui/react-editor';
import { registerToolbarItem } from '@svar-ui/react-toolbar';
import {
  Locale,
  Tabs,
  RichSelect,
  Slider,
  Counter,
  TwoState,
  Checkbox,
} from '@svar-ui/react-core';
import {
  defaultConstraintTypes,
  getEditorItems,
  prepareEditTask,
  getEditorButtons,
  filterEditorButtons,
  getDateEditorButtons,
  toInclusiveTask,
  fromInclusiveTask,
} from '@svar-ui/gantt-store';
import { dateToString, locale } from '@svar-ui/lib-dom';
import { en } from '@svar-ui/gantt-locales';
import { en as coreEn } from '@svar-ui/core-locales';
import { context } from '@svar-ui/react-core';

import Links from './editor/Links.jsx';
import DateTimePicker from './editor/DateTimePicker.jsx';
import Resources from './editor/Resources.jsx';
import Segments from './editor/Segments.jsx';
import Constraint from './editor/Constraint.jsx';
import { useStore } from '@svar-ui/lib-react';

import './Editor.css';

registerEditorItem('select', RichSelect);
registerEditorItem('date', DateTimePicker);
registerEditorItem('twostate', TwoState);
registerEditorItem('slider', Slider);
registerEditorItem('counter', Counter);
registerEditorItem('links', Links);
registerEditorItem('checkbox', Checkbox);
registerEditorItem('resources', Resources);
registerEditorItem('segments', Segments);
registerEditorItem('constraint', Constraint);
registerToolbarItem('tabs', Tabs);

const defBatch = 'general';

const externalValues = {
  taskAssignments: null,
};

function Editor({
  api,
  items = [],
  css = '',
  layout = 'default',
  readonly = false,
  placement = 'sidebar',
  bottomBar = false,
  topBar = true,
  autoSave = true,
  focus = false,
  hotkeys = {},
}) {
  const lFromCtx = useContext(context.i18n);
  const l = useMemo(() => lFromCtx || locale({ ...en, ...coreEn }), [lFromCtx]);
  const _ = useMemo(() => l.getGroup('gantt'), [l]);
  const i18nData = l.getRaw();
  const dateFormat = useMemo(() => {
    const f = i18nData.gantt?.dateFormat || i18nData.formats?.dateFormat;
    return dateToString(f, i18nData.calendar);
  }, [i18nData]);

  const activeTask = useStore(api, '_activeTask');
  const taskId = useStore(api, 'activeTask');
  const unscheduledTasks = useStore(api, 'unscheduledTasks');
  const inactiveTasks = useStore(api, 'inactiveTasks');
  const rollups = useStore(api, 'rollups');
  const summary = useStore(api, 'summary');
  const links = useStore(api, 'links');
  const splitTasks = useStore(api, 'splitTasks');
  const taskTypes = useStore(api, 'taskTypes');
  const resources = useStore(api, 'resources') ?? null;
  const schedule = useStore(api, 'schedule');
  const undo = useStore(api, 'undo');
  const compactMode = useStore(api, '_compactMode');
  const deadlines = useStore(api, 'deadlines');
  const criticalPath = useStore(api, 'criticalPath');
  const inclusiveEnd = useStore(api, 'inclusiveEnd');

  const [activeBatch, setActiveBatch] = useState(defBatch);
  const styleCss = useMemo(
    () => (compactMode ? 'wx-full-screen' : ''),
    [compactMode],
  );

  const baseItems = useMemo(
    () =>
      getEditorItems({
        unscheduledTasks,
        inactiveTasks,
        rollups,
        summary,
        taskTypes,
        resources,
        splitTasks,
        deadlines,
        schedule,
        criticalPath,
      }),
    [
      unscheduledTasks,
      inactiveTasks,
      rollups,
      summary,
      taskTypes,
      resources,
      splitTasks,
      deadlines,
      schedule,
      criticalPath,
    ],
  );

  const [linksActions, setLinksActions] = useState(() => new Map());
  // not reactive in Svelte: a plain holder for the pending task change
  const taskChangesRef = useRef(null);
  const [assignmentsActions, setAssignmentsActions] = useState(() => new Map());
  const [segmentsActions, setSegmentsActions] = useState(() => new Map());
  const [inProgress, setInProgress] = useState(null);

  const [editorValues, setEditorValues] = useState();
  // a ref, not state: onValidation and onAction/onChange fire in one go,
  // handlers must see the errors at once
  const editorErrorsRef = useRef(null);

  const [notSavedValues, setNotSavedValues] = useState({ ...externalValues });

  const task = useMemo(() => {
    if (!activeTask) return null;
    const data = { ...activeTask };

    if (readonly) {
      // preserve parent to differentiate between segment and task
      let values = { parent: data.parent };
      const shown = inclusiveEnd
        ? toInclusiveTask(data, api.getTaskCalendar(data))
        : data;
      baseItems.forEach(({ key, comp }) => {
        if (comp !== 'links' && comp !== 'resources') {
          const value = shown[key];
          if (comp === 'date' && value instanceof Date) {
            values[key] = dateFormat(value);
          } else if (comp === 'slider' && key === 'progress') {
            values[key] = `${value}%`;
          } else if (comp === 'constraint') {
            const kind = defaultConstraintTypes.find(
              (t) => t.id === value?.type,
            );
            values[key] = kind
              ? `${_(kind.label)}: ${dateFormat(value.date)}`
              : '';
          } else {
            values[key] = value;
          }
        }
      });
      return values;
    }
    return inclusiveEnd
      ? toInclusiveTask(data, api.getTaskCalendar(data))
      : data;
  }, [activeTask, readonly, baseItems, dateFormat, inclusiveEnd, api, _]);

  // the form shows end-like dates under inclusiveEnd,
  // saves and app callbacks get the stored values behind them
  const [storedValues, setStoredValuesState] = useState(null);
  // read synchronously in handlers (handleChange -> save)
  const storedValuesRef = useRef(null);
  const setStoredValues = useCallback((v) => {
    storedValuesRef.current = v;
    setStoredValuesState(v);
  }, []);

  useEffect(() => {
    setEditorValues(task);
    setStoredValues(activeTask ? { ...activeTask } : null);
  }, [task, activeTask, setStoredValues]);

  useEffect(() => {
    setLinksActions(new Map());
    taskChangesRef.current = null;
    setAssignmentsActions(new Map());
    setSegmentsActions(new Map());
    editorErrorsRef.current = null;
    setInProgress(null);
    setActiveBatch((prev) => prev || defBatch);
    setNotSavedValues({ ...externalValues });
  }, [taskId]);

  // items

  const handleExternalChange = useCallback(({ view, event, values = {} }) => {
    const { id, action, data } = event;
    if (view === 'links') {
      setLinksActions((prev) => {
        const next = new Map(prev);
        // edits to one link add up: a type change survives a later lag change
        const prevEdit = prev.get(id);
        const merged =
          action === 'update-link' && prevEdit?.action === action
            ? { ...data, link: { ...prevEdit.data.link, ...data.link } }
            : data;
        next.set(id, { action, data: merged });
        return next;
      });
    } else if (view === 'resources') {
      setAssignmentsActions((prev) => {
        const next = new Map(prev);
        next.set(id, { action, data });
        return next;
      });
    } else if (view === 'segments') {
      setSegmentsActions((prev) => {
        const next = new Map(prev);
        next.set(id, { action, data });
        return next;
      });
    }
    setNotSavedValues((prev) => {
      const next = { ...prev };
      Object.keys(values).forEach((key) => {
        next[key] = values[key];
      });
      return next;
    });
  }, []);

  const onTabChange = useCallback((ev) => {
    setActiveBatch(ev.value);
  }, []);

  const normalizeItems = useCallback(
    function normalizeItems(srcItems, area = 'form') {
      if (!api || !srcItems || !Array.isArray(srcItems)) return srcItems;
      return srcItems
        .filter((b) => {
          if (!storedValues) return true;
          return !b.isHidden || !b.isHidden(storedValues, api.getState());
        })
        .map((b) => {
          const item = { ...b };
          if (item.items && Array.isArray(item.items)) {
            item.items = normalizeItems(item.items);
            return item;
          }
          if (area === 'form' && !item.batch) {
            item.batch = defBatch;
          }

          if (['links', 'resources', 'segments'].includes(item.key) && api) {
            item.api = api;
            item.autoSave = autoSave;
            if (item.key === 'resources') {
              item.taskAssignments = notSavedValues.taskAssignments;
            } else if (item.key === 'links') {
              if (!autoSave) item.edits = linksActions;
            } else if (item.key === 'segments') {
              item.segments = notSavedValues.segments;
            }
            item.onExtChange = handleExternalChange;
          }
          if (item.key === 'constraint') item.task = editorValues;
          if (item.id === 'tabs') {
            item.api = api;
            item.css = 'wx-gantt-tabs';
            item.value = activeBatch;
            item.onChange = item.onChange || onTabChange;
          }

          if (item.comp === 'slider' && item.key === 'progress') {
            item.labelTemplate = (value) => `${_(item.label)} ${value}%`;
          }
          if (item.text) item.text = _(item.text);
          if (item.label) item.label = _(item.label);
          if (item.options) item.options = normalizeItems(item.options);

          if (item.config) item.config = { ...item.config };
          if (item.config?.placeholder)
            item.config.placeholder = _(item.config.placeholder);

          if (item.comp === 'date' && api) {
            item.config = { ...item.config };
            item.config.buttons = getDateEditorButtons(
              item.key,
              unscheduledTasks,
            ).map((b) => _(b));
          }

          if (
            storedValues &&
            item.isDisabled &&
            item.isDisabled(
              storedValues,
              api.getState(),
              api.getTaskCalendar(storedValues),
            )
          ) {
            item.disabled = true;
          } else delete item.disabled;
          return item;
        });
    },
    [
      api,
      storedValues,
      editorValues,
      autoSave,
      notSavedValues,
      linksActions,
      activeBatch,
      _,
      unscheduledTasks,
      handleExternalChange,
      onTabChange,
    ],
  );

  const editorItems = useMemo(() => {
    const eItems = items.length ? items : baseItems;
    return normalizeItems(eItems);
  }, [items, baseItems, normalizeItems]);

  const editorBatches = useMemo(
    () => new Set(editorItems.map((i) => i.batch)),
    [editorItems],
  );

  // Reset activeBatch
  // (ex. Segments removed when all segments merged/removed)
  useEffect(() => {
    if (!editorBatches.has(activeBatch)) setActiveBatch(defBatch);
  }, [editorBatches, activeBatch]);

  const editorKeys = useMemo(
    () => editorItems.map((i) => i.key),
    [editorItems],
  );

  const normalizeBar = useCallback(
    (bar, batches, type) => {
      bar = typeof bar !== 'object' ? {} : { ...bar };
      if (!bar.items) {
        bar.items = getEditorButtons({
          resources,
          autoSave,
          splitTasks,
          deadlines,
          criticalPath,
          inactiveTasks,
          schedule,
        });
      }
      bar.items = filterEditorButtons(bar.items, (item) => {
        if (item.id === 'tabs') {
          item.type = item.type || type;
          // filter options by batches and hide tabs with one tab
          item.options = item.options.filter((op) => batches.has(op.id));
          if (item.options.length < 2) return false;
        }
        return true;
      });
      bar.items = normalizeItems(bar.items, 'toolbar');
      if (!bar.layout) {
        const isColumn = bar.items.some((i) => i.items);
        bar.layout = isColumn ? 'column' : 'row';
      }
      return bar;
    },
    [
      resources,
      autoSave,
      splitTasks,
      deadlines,
      criticalPath,
      inactiveTasks,
      schedule,
      normalizeItems,
    ],
  );

  const normalizedTopBar = useMemo(() => {
    if (!topBar || readonly) return false;
    return normalizeBar(topBar, editorBatches, 'top');
  }, [topBar, readonly, normalizeBar, editorBatches]);

  const normalizedBottomBar = useMemo(() => {
    if (!bottomBar || readonly) return false;
    return normalizeBar(bottomBar, editorBatches, 'bottom');
  }, [bottomBar, readonly, normalizeBar, editorBatches]);

  const deleteTask = useCallback(() => {
    api.exec('delete-task', { id: taskId });
  }, [api, taskId]);

  const hide = useCallback(() => {
    api.exec('show-editor', { id: null });
  }, [api]);

  const normalizeTask = useCallback(
    (t, key, input) => {
      prepareEditTask(t, api.getState(), api.getTaskCalendar(t), key);
      if (!input) setInProgress(false);
      return t;
    },
    [api],
  );

  const save = useCallback(
    (values) => {
      delete values.links;
      delete values.data;

      if (
        editorKeys.indexOf('duration') === -1 ||
        (values.segments && !values.duration)
      )
        delete values.duration;

      const data = {
        id: taskId,
        task: values,
      };
      if (autoSave && inProgress) data.inProgress = inProgress;

      api.exec('update-task', data);
    },
    [api, taskId, autoSave, inProgress, editorKeys],
  );

  const saveAll = useCallback(() => {
    // removals, then link updates, then the task change: a link update is
    // checked against the saved task
    const edits = [...linksActions.values()].filter((e) =>
      links.byId(e.data.id),
    );
    const steps = [
      ...edits.filter((e) => e.action === 'delete-link'),
      ...edits.filter((e) => e.action !== 'delete-link'),
    ];

    const history = api.getHistory();
    history?.startBatch();
    steps.forEach(({ action, data }) => api.exec(action, data));
    if (taskChangesRef.current) save({ ...taskChangesRef.current });
    [assignmentsActions, segmentsActions].forEach((actions) => {
      for (let [, value] of actions) {
        const { action, data } = value;
        api.exec(action, data);
      }
    });
    history?.endBatch();
    taskChangesRef.current = null;
  }, [api, links, linksActions, assignmentsActions, segmentsActions, save]);

  const handleAction = useCallback(
    (ev) => {
      const { item } = ev;
      if (item.id === 'delete') {
        deleteTask();
      } else if (item.id === 'save') {
        if (editorErrorsRef.current) return;
        saveAll();
      }
      if (item.comp) hide();
    },
    [deleteTask, saveAll, hide],
  );

  const handleChange = useCallback(
    (ev) => {
      let { update, key, input } = ev;

      if (input) setInProgress(true);

      const values = inclusiveEnd
        ? fromInclusiveTask(update, key, storedValuesRef.current)
        : { ...update };
      const stored = normalizeTask(values, key, input);
      setStoredValues(stored);
      ev.update = inclusiveEnd
        ? toInclusiveTask(stored, api.getTaskCalendar(stored))
        : { ...stored };

      if (!autoSave) setEditorValues(ev.update);
      else if (!editorErrorsRef.current && !input) {
        const item = editorItems.find((i) => i.key === key);
        const v = update[key];
        const isValid = !item.validation || item.validation(v);
        if (isValid && (!item.required || v)) save({ ...stored });
      }
    },
    [
      api,
      autoSave,
      inclusiveEnd,
      normalizeTask,
      setStoredValues,
      editorItems,
      save,
    ],
  );

  const handleSave = useCallback(() => {
    if (!autoSave) taskChangesRef.current = { ...storedValuesRef.current };
  }, [autoSave]);

  const handleValidation = useCallback((check) => {
    // get all errors after onchange action
    editorErrorsRef.current = check.errors;
  }, []);

  const defaultHotkeys = useMemo(
    () =>
      undo
        ? {
            'ctrl+z': (ev) => {
              ev.preventDefault();
              api.exec('undo');
            },
            'ctrl+y': (ev) => {
              ev.preventDefault();
              api.exec('redo');
            },
          }
        : {},
    [undo, api],
  );

  return task ? (
    <Locale>
      <WxEditor
        css={`wx-XkvqDXuw wx-gantt-editor ${styleCss} ${css}`}
        items={editorItems}
        values={task}
        topBar={normalizedTopBar}
        bottomBar={normalizedBottomBar}
        placement={placement}
        layout={layout}
        readonly={readonly}
        autoSave={autoSave}
        focus={focus}
        activeBatch={activeBatch}
        onAction={handleAction}
        onSave={handleSave}
        onValidation={handleValidation}
        onChange={handleChange}
        hotkeys={hotkeys && { ...defaultHotkeys, ...hotkeys }}
      />
    </Locale>
  ) : null;
}

export default Editor;
