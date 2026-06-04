import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  useContext,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { ContextMenu as WxContextMenu } from '@svar-ui/react-menu';
import { handleAction, getMenuOptions, isHandledAction } from '@svar-ui/gantt-store';
import { locale, locateID, locate } from '@svar-ui/lib-dom';
import { en } from '@svar-ui/gantt-locales';
import { en as coreEn } from '@svar-ui/core-locales';
import { context } from '@svar-ui/react-core';
import { useStoreLater } from '@svar-ui/lib-react';
import './ContextMenu.css';

function cloneMenuItems(items) {
  return items.map((op) => {
    const copy = { ...op };
    if (op.data) copy.data = cloneMenuItems(op.data);
    return copy;
  });
}

const ContextMenu = forwardRef(function ContextMenu(
  {
    options: optionsInit = [],
    api = null,
    resolver = null,
    filter = null,
    at = 'point',
    children,
    onClick,
    css,
  },
  ref,
) {
  const menuRef = useRef(null);
  const activeIdRef = useRef(null);
  const [activeTask, setActiveTask] = useState(null);
  // built imperatively before the menu opens, not derived from the store
  // (avoids rebuild churn on every store tick)
  const [menuOptions, setMenuOptions] = useState([]);

  // i18n context
  const i18nCtx = useContext(context.i18n);
  const l = useMemo(() => i18nCtx || locale({ ...en, ...coreEn }), [i18nCtx]);
  const _ = useMemo(() => l.getGroup('gantt'), [l]);

  const taskTypesVal = useStoreLater(api, 'taskTypes');
  const selectedVal = useStoreLater(api, 'selected');
  const selectedTasksVal = useStoreLater(api, '_selected');
  const splitTasksVal = useStoreLater(api, 'splitTasks');
  const summaryVal = useStoreLater(api, 'summary');
  const groupByVal = useStoreLater(api, 'groupBy');

  const config = useMemo(
    () => ({
      splitTasks: splitTasksVal,
      taskTypes: taskTypesVal,
      summary: summaryVal,
      group: !!groupByVal?.field,
    }),
    [splitTasksVal, taskTypesVal, summaryVal, groupByVal],
  );

  const fullOptions = useMemo(() => getMenuOptions(config), [config]);

  const customOptions = useMemo(
    () => (optionsInit.length ? optionsInit : null),
    [optionsInit],
  );
  const localizedOptions = useMemo(
    () => applyLocaleFn(customOptions ?? fullOptions),
    [customOptions, fullOptions, _],
  );

  useEffect(() => {
    if (!api) return;

    api.on('scroll-chart', () => {
      if (menuRef.current && menuRef.current.show) menuRef.current.show();
    });
    api.on('drag-task', () => {
      if (menuRef.current && menuRef.current.show) menuRef.current.show();
    });
  }, [api]);

  function applyLocaleFn(opts) {
    return opts.map((op) => {
      op = { ...op };
      if (op.text) op.text = _(op.text);
      if (op.subtext) op.subtext = _(op.subtext);
      if (op.data) op.data = applyLocaleFn(op.data);
      return op;
    });
  }

  // _selected lags behind single selection from resolver (setAsyncState)
  const tasks = useMemo(
    () =>
      selectedTasksVal && selectedTasksVal.length
        ? selectedTasksVal
        : activeTask
          ? [activeTask]
          : [],
    [selectedTasksVal, activeTask],
  );

  const buildOptions = useCallback(
    (tasksArg = tasks) => {
      if (!api) return [];
      const items = cloneMenuItems(localizedOptions);
      const setDisabled = (data) => {
        data.forEach((item) => {
          if (item.isDisabled) {
            item.disabled = tasksArg.some((task) =>
              item.isDisabled(
                task,
                api.getState(),
                api.getTaskCalendar(task),
                activeIdRef.current,
              ),
            );
          }
          if (item.data) setDisabled(item.data);
        });
      };
      setDisabled(items);
      return items;
    },
    [api, localizedOptions, tasks],
  );

  const itemResolver = useCallback(
    (id, ev) => {
      if (
        locate(ev.target, 'data-menu-ignore')?.classList.contains(
          'wx-resource-load',
        )
      )
        return null;

      let task = id ? api?.getTask(id) : null;
      if (resolver) {
        const result = resolver(id, ev);
        task = result === true ? task : result;
      }
      setActiveTask(task);

      if (task) {
        const segmentIndex = locateID(ev.target, 'data-segment');
        if (segmentIndex !== null)
          activeIdRef.current = { id: task.id, segmentIndex };
        else activeIdRef.current = task.id;

        if (!Array.isArray(selectedVal) || !selectedVal.includes(task.id)) {
          api && api.exec && api.exec('select-task', { id: task.id });
        }

        // activeTask state update is async, so build with the freshly
        // resolved task to mirror the Svelte `tasks` derived
        const effectiveTasks =
          selectedTasksVal && selectedTasksVal.length
            ? selectedTasksVal
            : [task];
        setMenuOptions(buildOptions(effectiveTasks));
      }
      return task;
    },
    [api, resolver, selectedVal, selectedTasksVal, buildOptions],
  );

  const menuAction = useCallback(
    (ev) => {
      const action = ev.action;
      if (action) {
        const isAction = isHandledAction(fullOptions, action.id);
        if (isAction) handleAction(api, action.id, activeIdRef.current, _);
        onClick && onClick(ev);
      }
    },
    [api, _, onClick, fullOptions],
  );

  const filterMenu = useCallback(
    (item) => {
      if (!api) return true;
      let result = filter ? tasks.every((t) => filter(item, t)) : true;

      if (result) {
        if (item.isHidden)
          result = !tasks.some((t) =>
            item.isHidden(t, api.getState(), activeIdRef.current),
          );
      }
      return result;
    },
    [filter, tasks, api],
  );

  useImperativeHandle(ref, () => ({
    show: (ev, obj) => {
      setMenuOptions(buildOptions());
      if (menuRef.current && menuRef.current.show) {
        menuRef.current.show(ev, obj);
      }
    },
  }));

  const onContextMenu = useCallback((e) => {
    if (menuRef.current && menuRef.current.show) {
      menuRef.current.show(e);
    }
  }, []);

  const content = (
    <>
      <WxContextMenu
        filter={filterMenu}
        options={menuOptions}
        dataKey={'id'}
        resolver={itemResolver}
        onClick={menuAction}
        at={at}
        ref={menuRef}
        css={css}
      />
      <span onContextMenu={onContextMenu} data-menu-ignore="true">
        {typeof children === 'function' ? children() : children}
      </span>
    </>
  );

  if (!i18nCtx && context.i18n?.Provider) {
    const Provider = context.i18n.Provider;
    return <Provider value={l}>{content}</Provider>;
  }

  return content;
});

export default ContextMenu;
