import {
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useContext,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { ContextMenu as WxContextMenu } from '@svar-ui/react-menu';
import { handleAction, getMenuOptions, isHandledAction } from '@svar-ui/gantt-store';
import { locale, locateID } from '@svar-ui/lib-dom';
import { en } from '@svar-ui/gantt-locales';
import { en as coreEn } from '@svar-ui/core-locales';
import { context } from '@svar-ui/react-core';
import { useStoreLater } from '@svar-ui/lib-react';
import './ContextMenu.css';

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

  // i18n context
  const i18nCtx = useContext(context.i18n);
  const l = useMemo(() => i18nCtx || locale({ ...en, ...coreEn }), [i18nCtx]);
  const _ = useMemo(() => l.getGroup('gantt'), [l]);

  const taskTypesVal = useStoreLater(api, 'taskTypes');
  const selectedVal = useStoreLater(api, 'selected');
  const selectedTasksVal = useStoreLater(api, '_selected');
  const splitTasksVal = useStoreLater(api, 'splitTasks');
  const summaryVal = useStoreLater(api, 'summary');

  const config = useMemo(
    () => ({
      splitTasks: splitTasksVal,
      taskTypes: taskTypesVal,
      summary: summaryVal,
    }),
    [splitTasksVal, taskTypesVal, summaryVal],
  );

  const fullOptions = useMemo(() => getMenuOptions(config), [config]);

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

  function getOptions() {
    const finalOptions = optionsInit.length
      ? optionsInit
      : getMenuOptions(config);

    return applyLocaleFn(finalOptions);
  }

  const cOptions = useMemo(() => {
    return getOptions();
  }, [api, optionsInit, config, _]);

  const selectedTasks = useMemo(
    () => (selectedTasksVal && selectedTasksVal.length ? selectedTasksVal : []),
    [selectedTasksVal],
  );

  const itemResolver = useCallback(
    (id, ev) => {
      let task = id ? api?.getTask(id) : null;
      if (resolver) {
        const result = resolver(id, ev);
        task = result === true ? task : result;
      }
      if (task) {
        const segmentIndex = locateID(ev.target, 'data-segment');
        if (segmentIndex !== null)
          activeIdRef.current = { id: task.id, segmentIndex };
        else activeIdRef.current = task.id;

        if (!Array.isArray(selectedVal) || !selectedVal.includes(task.id)) {
          api && api.exec && api.exec('select-task', { id: task.id });
        }
      }
      return task;
    },
    [api, resolver, selectedVal],
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
    (item, task) => {
      // for single selection from resolver _selected are empty
      // due to setAsyncState causing _selected to lag
      const tasks = selectedTasks.length ? selectedTasks : task ? [task] : [];

      let result = filter ? tasks.every((t) => filter(item, t)) : true;

      if (result) {
        if (item.isHidden)
          result = !tasks.some((t) =>
            item.isHidden(t, api.getState(), activeIdRef.current),
          );
        if (item.isDisabled) {
          const disabled = tasks.some((t) =>
            item.isDisabled(t, api.getState(), activeIdRef.current),
          );
          item.disabled = disabled;
        }
      }
      return result;
    },
    [filter, selectedTasks, api],
  );

  useImperativeHandle(ref, () => ({
    show: (ev, obj) => {
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
        options={cOptions}
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
