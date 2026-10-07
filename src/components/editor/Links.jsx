import {
  Fragment,
  useState,
  useEffect,
  useMemo,
  useRef,
  useContext,
} from 'react';
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
  batch = 'links',
  edits = null,
}) {
  const i18n = useContext(context.i18n);
  const _ = useMemo(() => i18n.getGroup('gantt'), [i18n]);

  const activeTask = useStore(api, 'activeTask');
  const [links, linksCounter] = useStoreWithCounter(api, 'links');
  const tasks = useStore(api, 'tasks');
  const schedule = useStore(api, 'schedule');

  const list = useMemo(
    () => [
      { id: 'e2s', label: _('End-to-start') },
      { id: 's2s', label: _('Start-to-start') },
      { id: 'e2e', label: _('End-to-end') },
      { id: 's2e', label: _('Start-to-end') },
    ],
    [_],
  );

  const [linksData, setLinksData] = useState();

  // column editors are called lazily by the grid: read the latest values
  const linksRef = useRef(links);
  linksRef.current = links;
  const linksDataRef = useRef(linksData);
  linksDataRef.current = linksData;

  function getTypeOptions(row) {
    const link = linksRef.current.byId(row.id);
    if (!link) return list;
    const taken = getPairTypes(link, row.id);
    const check = api.getLinkValidator();
    return list.filter(
      ({ id: type }) =>
        type === row.type || (!taken.has(type) && !check({ ...link, type })),
    );
  }

  function getPairTypes(link, except) {
    const out = new Set();
    (linksDataRef.current || []).forEach((group) =>
      group.data.forEach((row) => {
        if (row.id === except) return;
        const other = linksRef.current.byId(row.id);
        if (other?.source === link.source && other.target === link.target)
          out.add(row.type);
      }),
    );
    return out;
  }

  const isLagHidden = useMemo(() => !schedule?.auto, [schedule]);

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
        editor: { type: 'text', config: { type: 'number' } },
        flexgrow: 1,
        hidden: isLagHidden,
      },
      {
        id: 'type',
        header: _('Type'),
        width: 124,
        options: list,
        editor: (row) => ({
          type: 'richselect',
          config: {
            cell: LinkTypeCell,
            options: getTypeOptions(row),
          },
        }),
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
    if (!activeTask) return;
    const inLinks = [];
    const outLinks = [];
    const toRow = (link, other) => ({
      id: link.id,
      type: link.type,
      lag: link.lag,
      taskText: tasks.byId(other).text,
    });
    links.forEach((saved) => {
      const edit = edits?.get(saved.id);
      if (edit?.action === 'delete-link') return;
      const link = edit ? { ...saved, ...edit.data.link } : saved;
      if (link.target === activeTask) inLinks.push(toRow(link, link.source));
      if (link.source === activeTask) outLinks.push(toRow(link, link.target));
    });
    return [
      { title: _('Predecessors'), data: inLinks },
      { title: _('Successors'), data: outLinks },
    ];
  }

  useEffect(() => {
    setLinksData(getLinksData());
  }, [activeTask, links, linksCounter, tasks, edits]);

  function getActionData(evData) {
    return { view: 'links', event: evData };
  }

  function onDeleteAction(id) {
    if (autoSave) {
      api.exec('delete-link', { id });
    } else {
      setLinksData((prev) =>
        (prev || []).map((group) => ({
          ...group,
          data: group.data.filter((item) => item.id !== id),
        })),
      );
      onExtChange &&
        onExtChange(
          getActionData({
            id,
            action: 'delete-link',
            data: { id },
          }),
        );
    }
  }

  function onEdit(id, column, value) {
    if (column === 'lag' && value !== '') value = value * 1;

    const update = { [column]: value };

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
            item.id === id ? { ...item, ...update } : item,
          ),
        })),
      );
      onExtChange &&
        onExtChange(
          getActionData({
            id,
            action: 'update-link',
            data: {
              id,
              link: update,
            },
          }),
        );
    }
  }

  const columns = useMemo(() => getColumns(), [_, list, isLagHidden, api]);

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
