import { useContext, useMemo } from 'react';
import { Toolbar as WxToolbar } from '@svar-ui/react-toolbar';
import { useStoreLater } from '@svar-ui/lib-react';
import {
  handleAction,
  getToolbarButtons,
  isHandledAction,
} from '@svar-ui/gantt-store';
import { locale } from '@svar-ui/lib-dom';
import { en } from '@svar-ui/gantt-locales';
import { context } from '@svar-ui/react-core';

export default function Toolbar({ api = null, items = [] }) {
  const i18nCtx = useContext(context.i18n);
  const i18nLocal = useMemo(() => (i18nCtx ? i18nCtx : locale(en)), [i18nCtx]);
  const _ = useMemo(() => i18nLocal.getGroup('gantt'), [i18nLocal]);

  const _selected = useStoreLater(api, '_selected');
  const undo = useStoreLater(api, 'undo');
  const history = useStoreLater(api, 'history');
  const splitTasks = useStoreLater(api, 'splitTasks');
  const groupBy = useStoreLater(api, 'groupBy');

  const historyActions = ['undo', 'redo'];

  const finalItems = useMemo(() => {
    const fullButtons = getToolbarButtons({ undo: true, splitTasks: true });
    const buttons = items.length
      ? items
      : getToolbarButtons({
          undo,
          splitTasks,
          group: !!groupBy?.field,
        });
    return buttons.map((b) => {
      let item = { ...b, disabled: false };
      item.handler = isHandledAction(fullButtons, item.id)
        ? (it) => handleAction(api, it.id, null, _)
        : item.handler;
      if (item.text) item.text = _(item.text);
      if (item.menuText) item.menuText = _(item.menuText);
      return item;
    });
  }, [items, api, _, undo, splitTasks, groupBy]);

  const buttons = useMemo(() => {
    const finalButtons = [];
    finalItems.forEach((item) => {
      const action = item.id;

      if (action === 'add-task' || !historyActions.includes(action)) {
        if (!_selected?.length || !api) {
          if (action !== 'add-task') return;
          finalButtons.push(item);
        } else {
          finalButtons.push({
            ...item,
            disabled:
              item.isDisabled &&
              _selected.some((task) =>
                item.isDisabled(
                  task,
                  api.getState(),
                  api.getTaskCalendar(task)
                )
              ),
          });
        }
      } else if (historyActions.includes(action)) {
        finalButtons.push({
          ...item,
          disabled: item.isDisabled(history),
        });
      }
    });
    // filter out consecutive separators
    return finalButtons.filter((button, index) => {
      if (api && button.isHidden)
        return !_selected.some((task) => button.isHidden(task, api.getState()));
      if (button.comp === 'separator') {
        const nextButton = finalButtons[index + 1];
        if (!nextButton || nextButton.comp === 'separator') return false;
      }
      return true;
    });
  }, [api, _selected, history, finalItems]);

  if (!i18nCtx) {
    return (
      <context.i18n.Provider value={i18nLocal}>
        <WxToolbar items={buttons} />
      </context.i18n.Provider>
    );
  }

  return <WxToolbar items={buttons} />;
}
