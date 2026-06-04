import { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { Editor as WxEditor, registerEditorItem } from '@svar-ui/react-editor';
import { registerToolbarItem } from '@svar-ui/react-toolbar';
import { Locale, Tabs, RichSelect, Slider, Counter, TwoState, Checkbox } from '@svar-ui/react-core';
import {
  getEditorItems,
  prepareEditTask,
  getEditorButtons,
  filterEditorButtons,
} from '@svar-ui/gantt-store';
import { dateToString, locale } from '@svar-ui/lib-dom';
import { en } from '@svar-ui/gantt-locales';
import { en as coreEn } from '@svar-ui/core-locales';
import { context } from '@svar-ui/react-core';

import Links from './editor/Links.jsx';
import DateTimePicker from './editor/DateTimePicker.jsx';
import Resources from './editor/Resources.jsx';
import Segments from './editor/Segments.jsx';
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
registerToolbarItem('tabs', Tabs);

const defBatch = 'general';

const externalValues = {
  taskAssignments: null,
  predecessors: null,
  successors: null,
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
  const rollups = useStore(api, 'rollups');
  const summary = useStore(api, 'summary');
  const links = useStore(api, 'links');
  const splitTasks = useStore(api, 'splitTasks');
  const taskTypes = useStore(api, 'taskTypes');
  const resources = useStore(api, 'resources') ?? null;
  const undo = useStore(api, 'undo');
  const compactMode = useStore(api, '_compactMode');

  const [activeBatch, setActiveBatch] = useState(defBatch);
  const styleCss = useMemo(
    () => (compactMode ? 'wx-full-screen' : ''),
    [compactMode],
  );

  const baseItems = useMemo(
    () =>
      getEditorItems({
        unscheduledTasks,
        rollups,
        summary,
        taskTypes,
        resources,
        splitTasks,
      }),
    [unscheduledTasks, rollups, summary, taskTypes, resources, splitTasks],
  );

  const [linksActions, setLinksActions] = useState(() => new Map());
  const [assignmentsActions, setAssignmentsActions] = useState(() => new Map());
  const [segmentsActions, setSegmentsActions] = useState(() => new Map());
  const [inProgress, setInProgress] = useState(null);

  const [editorValues, setEditorValues] = useState();
  const [editorErrors, setEditorErrors] = useState(null);

  const [notSavedValues, setNotSavedValues] = useState({ ...externalValues });

  const task = useMemo(() => {
    if (!activeTask) return null;
    const data = { ...activeTask };

    if (readonly) {
      // preserve parent to differentiate between segment and task
      let values = { parent: data.parent };
      baseItems.forEach(({ key, comp }) => {
        if (comp !== 'links' && comp !== 'resources') {
          const value = data[key];
          if (comp === 'date' && value instanceof Date) {
            values[key] = dateFormat(value);
          } else if (comp === 'slider' && key === 'progress') {
            values[key] = `${value}%`;
          } else {
            values[key] = value;
          }
        }
      });
      return values;
    }
    return data || null;
  }, [activeTask, readonly, baseItems, dateFormat]);

  useEffect(() => {
    setEditorValues(task);
  }, [task]);

  useEffect(() => {
    setLinksActions(new Map());
    setAssignmentsActions(new Map());
    setSegmentsActions(new Map());
    setEditorErrors(null);
    setInProgress(null);
    setActiveBatch((prev) => prev || defBatch);
    setNotSavedValues({ ...externalValues });
  }, [taskId]);

  // items

  const handleExternalChange = useCallback(({ view, event, values }) => {
    const { id, action, data } = event;
    if (view === 'links') {
      setLinksActions((prev) => {
        const next = new Map(prev);
        next.set(id, { action, data });
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
          if (!editorValues) return true;
          return !b.isHidden || !b.isHidden(editorValues, api.getState());
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

          if (
            ['links', 'resources', 'segments'].includes(item.key) &&
            api
          ) {
            item.api = api;
            item.autoSave = autoSave;
            if (item.key === 'resources') {
              item.taskAssignments = notSavedValues.taskAssignments;
            } else if (item.key === 'links') {
              item.successors = notSavedValues.successors;
              item.predecessors = notSavedValues.predecessors;
            } else if (item.key === 'segments') {
              item.segments = notSavedValues.segments;
            }
            item.onExtChange = handleExternalChange;
          }
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

          if (
            editorValues &&
            item.isDisabled &&
            item.isDisabled(
              editorValues,
              api.getState(),
              api.getTaskCalendar(editorValues),
            )
          ) {
            item.disabled = true;
          } else delete item.disabled;
          return item;
        });
    },
    [api, editorValues, autoSave, notSavedValues, activeBatch, _, handleExternalChange, onTabChange],
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
    [resources, autoSave, splitTasks, normalizeItems],
  );

  const normalizedTopBar = useMemo(() => {
    if (!topBar || readonly) return false;
    return normalizeBar(topBar, editorBatches, 'top');
  }, [topBar, readonly, normalizeBar, editorBatches]);

  const normalizedBottomBar = useMemo(() => {
    if (!bottomBar || readonly) return false;
    return normalizeBar(bottomBar, editorBatches, 'bottom');
  }, [bottomBar, readonly, normalizeBar, editorBatches]);

  const saveSections = useCallback(() => {
    for (let [linkId, value] of linksActions) {
      if (links.byId(linkId)) {
        const { action, data } = value;
        api.exec(action, data);
      }
    }
    [assignmentsActions, segmentsActions].forEach((actions) => {
      for (let [, value] of actions) {
        const { action, data } = value;
        api.exec(action, data);
      }
    });
  }, [api, links, linksActions, assignmentsActions, segmentsActions]);

  const deleteTask = useCallback(() => {
    api.exec('delete-task', { id: taskId });
  }, [api, taskId]);

  const hide = useCallback(() => {
    api.exec('show-editor', { id: null });
  }, [api]);

  const handleAction = useCallback(
    (ev) => {
      const { item } = ev;
      if (item.id === 'delete') {
        deleteTask();
      } else if (item.id === 'save') {
        saveSections();
      }
      if (item.comp) hide();
    },
    [deleteTask, saveSections, hide],
  );

  const normalizeTask = useCallback(
    (t, key, input) => {
      if (unscheduledTasks && t.type === 'summary') t.unscheduled = false;

      prepareEditTask(t, api.getState(), api.getTaskCalendar(t), key);
      if (!input) setInProgress(false);
      return t;
    },
    [unscheduledTasks, api],
  );

  const save = useCallback(
    (values, changes) => {
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

      // when changes is not empty, Editor calls onSave and onAction({id: "save"})
      if (!autoSave && !changes?.length) saveSections();
    },
    [api, taskId, autoSave, inProgress, editorKeys, saveSections],
  );

  const handleChange = useCallback(
    (ev) => {
      let { update, key, input } = ev;

      if (input) setInProgress(true);

      ev.update = normalizeTask({ ...update }, key, input);

      if (!autoSave) setEditorValues(ev.update);
      else if (!editorErrors && !input) {
        const item = editorItems.find((i) => i.key === key);
        const v = update[key];
        const isValid = !item.validation || item.validation(v);
        if (isValid && (!item.required || v)) save(ev.update);
      }
    },
    [autoSave, normalizeTask, editorErrors, editorItems, save],
  );

  const handleSave = useCallback(
    (ev) => {
      if (!autoSave) save(ev.values, ev.changes);
    },
    [autoSave, save],
  );

  const handleValidation = useCallback((check) => {
    // get all errors after onchange action
    setEditorErrors(check.errors);
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
