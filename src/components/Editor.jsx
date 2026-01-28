import { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { Editor as WxEditor, registerEditorItem } from '@svar-ui/react-editor';
import { Locale, RichSelect, Slider, Counter, TwoState } from '@svar-ui/react-core';
import { getEditorItems, prepareEditTask } from '@svar-ui/gantt-store';
import { dateToString, locale } from '@svar-ui/lib-dom';
import { en } from '@svar-ui/gantt-locales';
import { en as coreEn } from '@svar-ui/core-locales';
import { context } from '@svar-ui/react-core';

import Links from './editor/Links.jsx';
import DateTimePicker from './editor/DateTimePicker.jsx';
import { useStore } from '@svar-ui/lib-react';

// helpers
import { modeObserver } from '../helpers/modeResizeObserver';

import './Editor.css';

registerEditorItem('select', RichSelect);
registerEditorItem('date', DateTimePicker);
registerEditorItem('twostate', TwoState);
registerEditorItem('slider', Slider);
registerEditorItem('counter', Counter);
registerEditorItem('links', Links);

function Editor({
  api,
  items = [],
  css = '',
  layout = 'default',
  readonly = false,
  placement = 'sidebar',
  bottomBar = true,
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

  const normalizedTopBar = useMemo(() => {
    if (topBar === true && !readonly) {
      const buttons = [
        { comp: 'icon', icon: 'wxi-close', id: 'close' },
        { comp: 'spacer' },
        {
          comp: 'button',
          type: 'danger',
          text: _('Delete'),
          id: 'delete',
        },
      ];
      if (autoSave) return { items: buttons };
      return {
        items: [
          ...buttons,
          {
            comp: 'button',
            type: 'primary',
            text: _('Save'),
            id: 'save',
          },
        ],
      };
    }
    return topBar;
  }, [topBar, readonly, autoSave, _]);

  // resize
  const [compactMode, setCompactMode] = useState(false);
  const styleCss = useMemo(
    () => (compactMode ? 'wx-full-screen' : ''),
    [compactMode],
  );

  const handleResize = useCallback((mode) => {
    setCompactMode(mode);
  }, []);

  useEffect(() => {
    const ro = modeObserver(handleResize);
    ro.observe();
    return () => {
      ro.disconnect();
    };
  }, [handleResize]);

  const activeTask = useStore(api, '_activeTask');
  const taskId = useStore(api, 'activeTask');
  const unscheduledTasks = useStore(api, 'unscheduledTasks');
  const summary = useStore(api, 'summary');
  const links = useStore(api, 'links');
  const splitTasks = useStore(api, 'splitTasks');
  const segmentIndex = useMemo(
    () => splitTasks && taskId?.segmentIndex,
    [splitTasks, taskId],
  );
  const isSegment = useMemo(
    () => segmentIndex || segmentIndex === 0,
    [segmentIndex],
  );
  const taskTypes = useStore(api, 'taskTypes');
  const baseItems = useMemo(
    () => getEditorItems({ unscheduledTasks, summary, taskTypes }),
    [unscheduledTasks, summary, taskTypes],
  );
  const undo = useStore(api, 'undo');

  const [linksActionsMap, setLinksActionsMap] = useState({});
  const [inProgress, setInProgress] = useState(null);
  const [editorValues, setEditorValues] = useState();
  const [editorErrors, setEditorErrors] = useState(null);

  const task = useMemo(() => {
    if (!activeTask) return null;
    let data;
    if (isSegment && activeTask.segments)
      data = { ...activeTask.segments[segmentIndex] };
    else data = { ...activeTask };

    if (readonly) {
      // preserve parent to differentiate between segment and task
      let values = { parent: data.parent };
      baseItems.forEach(({ key, comp }) => {
        if (comp !== 'links') {
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
  }, [activeTask, isSegment, segmentIndex, readonly, baseItems, dateFormat]);

  useEffect(() => {
    setEditorValues(task);
  }, [task]);

  useEffect(() => {
    setLinksActionsMap({});
    setEditorErrors(null);
    setInProgress(null);
  }, [taskId]);

  function prepareEditorItems(localItems, taskData) {
    return localItems.map((a) => {
      const item = { ...a };
      if (a.config) item.config = { ...item.config };
      if (item.comp === 'links' && api) {
        item.api = api;
        item.autoSave = autoSave;
        item.onLinksChange = handleLinksChange;
      }
      if (item.comp === 'select' && item.key === 'type') {
        const options = item.options ?? [];
        item.options = options.map((t) => ({
          ...t,
          label: _(t.label),
        }));
      }

      if (item.comp === 'slider' && item.key === 'progress') {
        item.labelTemplate = (value) => `${_(item.label)} ${value}%`;
      }

      if (item.label) item.label = _(item.label);
      if (item.config?.placeholder)
        item.config.placeholder = _(item.config.placeholder);

      if (taskData) {
        if (item.isDisabled && item.isDisabled(taskData, api.getState())) {
          item.disabled = true;
        } else delete item.disabled;
      }
      return item;
    });
  }

  const editorItems = useMemo(() => {
    let eItems = items.length ? items : baseItems;
    eItems = prepareEditorItems(eItems, editorValues);
    if (!editorValues) return eItems;
    return eItems.filter(
      (item) => !item.isHidden || !item.isHidden(editorValues, api.getState()),
    );
  }, [items, baseItems, editorValues, _, api, autoSave]);

  const editorKeys = useMemo(
    () => editorItems.map((i) => i.key),
    [editorItems],
  );

  function handleLinksChange({ id, action, data }) {
    setLinksActionsMap((prev) => ({
      ...prev,
      [id]: { action, data },
    }));
  }

  const saveLinks = useCallback(() => {
    for (let link in linksActionsMap) {
      if (links.byId(link)) {
        const { action, data } = linksActionsMap[link];
        api.exec(action, data);
      }
    }
  }, [api, linksActionsMap, links]);

  const deleteTask = useCallback(() => {
    const id = taskId?.id || taskId;
    if (isSegment) {
      if (activeTask?.segments) {
        const segments = activeTask.segments.filter(
          (s, index) => index !== segmentIndex,
        );
        api.exec('update-task', {
          id,
          task: { segments },
        });
      }
    } else {
      api.exec('delete-task', { id });
    }
  }, [api, taskId, isSegment, activeTask, segmentIndex]);

  const hide = useCallback(() => {
    api.exec('show-editor', { id: null });
  }, [api]);

  const handleAction = useCallback(
    (ev) => {
      const { item, changes } = ev;
      if (item.id === 'delete') {
        deleteTask();
      }
      if (item.id === 'save') {
        if (!changes.length) saveLinks();
        else hide();
      }
      if (item.comp) hide();
    },
    [api, taskId, autoSave, saveLinks, deleteTask, hide],
  );

  const normalizeTask = useCallback(
    (t, key, input) => {
      if (unscheduledTasks && t.type === 'summary') t.unscheduled = false;

      prepareEditTask(t, api.getState(), key);
      if (!input) setInProgress(false);
      return t;
    },
    [unscheduledTasks, api],
  );

  const save = useCallback(
    (values) => {
      values = {
        ...values,
        unscheduled:
          unscheduledTasks && values.unscheduled && values.type !== 'summary',
      };
      delete values.links;
      delete values.data;

      if (
        editorKeys.indexOf('duration') === -1 ||
        (values.segments && !values.duration)
      )
        delete values.duration;

      const data = {
        id: taskId?.id || taskId,
        task: values,
        ...(isSegment && { segmentIndex }),
      };
      if (autoSave && inProgress) data.inProgress = inProgress;

      api.exec('update-task', data);

      if (!autoSave) saveLinks();
    },
    [
      api,
      taskId,
      unscheduledTasks,
      autoSave,
      saveLinks,
      editorKeys,
      isSegment,
      segmentIndex,
      inProgress,
    ],
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
      if (!autoSave) save(ev.values);
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
        bottomBar={bottomBar}
        placement={placement}
        layout={layout}
        readonly={readonly}
        autoSave={autoSave}
        focus={focus}
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
