import { Fragment, useState, useEffect, useMemo, useContext } from 'react';
import { context } from '@svar-ui/react-core';
import { useStore, useStoreWithCounter } from '@svar-ui/lib-react';

import ActionCell from '../grid/ActionCell.jsx';
import GridSection from './GridSection.jsx';
import LinkTypeCell from './LinkTypeCell.jsx';
import './Links.css';

export default function Links({
  api,
  autoSave,
  onExtChange,
  predecessors = null,
  successors = null,
  batch = 'links',
}) {
  const i18n = useContext(context.i18n);
  const _ = useMemo(() => i18n.getGroup('gantt'), [i18n]);

  const activeTask = useStore(api, 'activeTask');
  const _activeTask = useStore(api, '_activeTask');
  const [links, linksCounter] = useStoreWithCounter(api, 'links');
  const tasks = useStore(api, 'tasks');
  const schedule = useStore(api, 'schedule');
  const unscheduledTasks = useStore(api, 'unscheduledTasks');

  const list = useMemo(
    () => [
      { id: 'e2s', label: _('End-to-start') },
      { id: 's2s', label: _('Start-to-start') },
      { id: 'e2e', label: _('End-to-end') },
      { id: 's2e', label: _('Start-to-end') },
    ],
    [_],
  );

  function lagEditorHandler(row) {
    return row.type === 'e2s'
      ? { type: 'text', config: { type: 'number' } }
      : null;
  }

  const isLagHidden = useMemo(
    () =>
      !schedule?.auto || (unscheduledTasks && _activeTask?.unscheduled),
    [schedule, unscheduledTasks, _activeTask],
  );

  function getColumns() {
    return [
      {
        id: 'taskText',
        header: _('Task name'),
        flexgrow: 2,
      },
      {
        id: 'lag',
        header: _('Lag'),
        editor: lagEditorHandler,
        flexgrow: 1,
        hidden: isLagHidden,
      },
      {
        id: 'type',
        header: _('Type'),
        width: 124,
        options: list,
        editor: {
          type: 'richselect',
          config: {
            cell: LinkTypeCell,
          },
        },
        cell: LinkTypeCell,
      },
      {
        id: 'delete',
        header: '',
        cell: ActionCell,
        width: 50,
        align: 'center',
      },
    ];
  }

  function getLinksData() {
    if (activeTask) {
      const il = [];
      const ol = [];

      if (!predecessors || !successors) {
        links.forEach((l) => {
          if (!predecessors && l.target === activeTask) il.push(l);
          if (!successors && l.source === activeTask) ol.push(l);
        });
      }

      const inLinks =
        predecessors ||
        il.map((link) => {
          const { id, lag, type, source } = link;
          return {
            id,
            type,
            lag,
            taskText: tasks.byId(source).text,
          };
        });

      const outLinks =
        successors ||
        ol.map((link) => {
          const { id, lag, type, target } = link;
          return {
            id,
            type,
            lag,
            taskText: tasks.byId(target).text,
          };
        });

      return [
        { title: _('Predecessors'), data: inLinks },
        { title: _('Successors'), data: outLinks },
      ];
    }
  }

  const [linksData, setLinksData] = useState();

  useEffect(() => {
    setLinksData(getLinksData());
  }, [activeTask, links, linksCounter, tasks, predecessors, successors]);

  function onDeleteAction(id) {
    if (autoSave) {
      api.exec('delete-link', { id });
    } else {
      setLinksData((prev) => {
        const next = (prev || []).map((group) => ({
          ...group,
          data: group.data.filter((item) => item.id !== id),
        }));
        onExtChange &&
          onExtChange({
            view: 'links',
            event: {
              id,
              action: 'delete-link',
              data: { id },
            },
            values: {
              predecessors: next[0].data,
              successors: next[1].data,
            },
          });
        return next;
      });
    }
  }

  function onEdit(id, column, value) {
    const update = { [column]: value };
    if (column === 'type' && schedule?.auto) {
      if (value !== 'e2s') update.lag = '';
    }

    if (autoSave) {
      api.exec('update-link', {
        id,
        link: update,
      });
    } else {
      setLinksData((prev) => {
        const next = (prev || []).map((group) => ({
          ...group,
          data: group.data.map((item) =>
            item.id === id ? { ...item, ...update } : item,
          ),
        }));
        onExtChange &&
          onExtChange({
            view: 'links',
            event: {
              id,
              action: 'update-link',
              data: {
                id,
                link: update,
              },
            },
            values: {
              predecessors: next[0].data,
              successors: next[1].data,
            },
          });
        return next;
      });
    }
  }

  const columns = useMemo(() => getColumns(), [_, list, isLagHidden]);

  const isMessage =
    linksData && !linksData[0].data.length && !linksData[1].data.length;

  const wrapperClassName = [
    'wx-j93aYGQf',
    'wx-wrapper',
    batch !== 'links' ? 'wx-nobatch' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClassName}>
      {(linksData || []).map((group, idx) =>
        group.data.length ? (
          <Fragment key={idx}>
            <div className="wx-j93aYGQf wx-title">{group.title}</div>
            <GridSection
              columns={columns}
              onAction={onDeleteAction}
              onEdit={onEdit}
              data={group.data}
              sizes={{
                rowHeight: 44,
              }}
            />
          </Fragment>
        ) : null,
      )}
      {isMessage ? (
        <div className="wx-j93aYGQf wx-nodata">{_('No links')}</div>
      ) : null}
    </div>
  );
}
