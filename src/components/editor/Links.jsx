import { useState, useEffect, useMemo, useContext } from 'react';
import { Field, Combo, Text } from '@svar-ui/react-core';
import { context } from '@svar-ui/react-core';
import { useStore } from '@svar-ui/lib-react';
import './Links.css';

export default function Links({ api, autoSave, onLinksChange }) {
  const i18n = useContext(context.i18n);
  const _ = i18n.getGroup('gantt');

  const activeTask = useStore(api, 'activeTask');
  const _activeTask = useStore(api, '_activeTask');
  const links = useStore(api, '_links');
  const schedule = useStore(api, 'schedule');
  const unscheduledTasks = useStore(api, 'unscheduledTasks');

  const [linksData, setLinksData] = useState();

  function getLinksData() {
    if (activeTask) {
      const inLinks = links
        .filter((a) => a.target == activeTask)
        .map((link) => ({ link, task: api.getTask(link.source) }));

      const outLinks = links
        .filter((a) => a.source == activeTask)
        .map((link) => ({ link, task: api.getTask(link.target) }));

      return [
        { title: _('Predecessors'), data: inLinks },
        { title: _('Successors'), data: outLinks },
      ];
    }
  }

  useEffect(() => {
    setLinksData(getLinksData());
  }, [activeTask, links]);

  const list = useMemo(
    () => [
      { id: 'e2s', label: _('End-to-start') },
      { id: 's2s', label: _('Start-to-start') },
      { id: 'e2e', label: _('End-to-end') },
      { id: 's2e', label: _('Start-to-end') },
    ],
    [_],
  );

  function deleteLink(id) {
    if (autoSave) {
      api.exec('delete-link', { id });
    } else {
      setLinksData((prev) =>
        (prev || []).map((group) => ({
          ...group,
          data: group.data.filter((item) => item.link.id !== id),
        })),
      );
      onLinksChange &&
        onLinksChange({
          id,
          action: 'delete-link',
          data: { id },
        });
    }
  }

  function handleChange(id, update) {
    if (autoSave) {
      api.exec('update-link', {
        id,
        link: update,
      });
    } else {
      setLinksData((prev) =>
        (prev || []).map((group) => ({
          ...group,
          data: group.data.map((item) =>
            item.link.id === id
              ? { ...item, link: { ...item.link, ...update } }
              : item,
          ),
        })),
      );
      onLinksChange &&
        onLinksChange({
          id,
          action: 'update-link',
          data: {
            id,
            link: update,
          },
        });
    }
  }

  return (
    <>
      {(linksData || []).map((group, idx) =>
        group.data.length ? (
          <div className="wx-j93aYGQf wx-links" key={idx}>
            <context.fieldId.Provider value={null}>
              <Field label={group.title} position="top">
                <table>
                  <tbody>
                    {group.data.map((obj) => (
                      <tr key={obj.link.id}>
                        <td className="wx-j93aYGQf wx-cell">
                          <div className="wx-j93aYGQf wx-task-name">
                            {obj.task.text || ''}
                          </div>
                        </td>
                        {schedule?.auto && obj.link.type === 'e2s' ? (
                          <td className="wx-j93aYGQf wx-cell wx-link-lag">
                            <Text
                              type="number"
                              placeholder={_('Lag')}
                              value={obj.link.lag}
                              disabled={
                                unscheduledTasks && _activeTask?.unscheduled
                              }
                              onChange={(ev) => {
                                if (!ev.input)
                                  handleChange(obj.link.id, { lag: ev.value });
                              }}
                            />
                          </td>
                        ) : null}
                        <td className="wx-j93aYGQf wx-cell">
                          <div className="wx-j93aYGQf wx-wrapper">
                            <Combo
                              value={obj.link.type}
                              placeholder={_('Select link type')}
                              options={list}
                              onChange={(ev) =>
                                handleChange(obj.link.id, { type: ev.value })
                              }
                            >
                              {({ option }) => option.label}
                            </Combo>
                          </div>
                        </td>

                        <td className="wx-j93aYGQf wx-cell">
                          <i
                            className="wx-j93aYGQf wxi-delete wx-delete-icon"
                            onClick={() => deleteLink(obj.link.id)}
                            role="button"
                          ></i>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Field>
            </context.fieldId.Provider>
          </div>
        ) : null,
      )}
    </>
  );
}
