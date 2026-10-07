import { useContext, useMemo, useState } from 'react';
import { Button, Icon, context } from '@svar-ui/react-core';
import { dateToString, locale } from '@svar-ui/lib-dom';
import { en } from '@svar-ui/gantt-locales';
import { en as coreEn } from '@svar-ui/core-locales';
import { defaultConstraintTypes } from '@svar-ui/gantt-store';
import { useStoreLater } from '@svar-ui/lib-react';
import './ConflictReport.css';

const constraintLabels = Object.fromEntries(
  defaultConstraintTypes.map((t) => [t.id, t.label]),
);
const typeIcons = {
  constraint: 'wxi-triangles-out-h',
  link: 'wxi-link',
};

function actionsFor(row) {
  const resolveAction = row.required
    ? { id: 'resolve', label: 'Move task' }
    : null;
  if (row.type === 'constraint')
    return [
      resolveAction,
      { id: 'remove-constraint', label: 'Remove constraint' },
    ].filter(Boolean);
  if (row.type === 'link')
    return [resolveAction, { id: 'remove-link', label: 'Remove link' }].filter(
      Boolean,
    );
  return [];
}

function taskIdFor(row) {
  return row.task ?? null;
}

function DetailLine({ label, value }) {
  return (
    <div className="wx-detail-line wx-aaeNX0k4">
      <span className="wx-detail-label wx-aaeNX0k4">{label}:</span>
      {value}
    </div>
  );
}

function ConflictReport(props) {
  const { api = null, onClose } = props;

  const i18nCtx = useContext(context.i18n);
  const l = useMemo(() => i18nCtx || locale({ ...en, ...coreEn }), [i18nCtx]);
  const { _, dateFormat } = useMemo(() => {
    const i18nData = l.getRaw();
    const f = i18nData.gantt?.dateFormat || i18nData.formats?.dateFormat;
    return {
      _: l.getGroup('gantt'),
      dateFormat: dateToString(f, i18nData.calendar),
    };
  }, [l]);

  const conflicts = useStoreLater(api, '_conflicts');
  const showConflicts = useStoreLater(api, 'showConflicts');
  const links = useStoreLater(api, 'links');
  const tasks = useStoreLater(api, 'tasks');
  const scaleHeight = useStoreLater(api, 'scaleHeight');

  const open = !!showConflicts;

  const [clickedId, setClickedId] = useState(null);
  const rows = useMemo(() => conflicts?.rows ?? [], [conflicts]);
  const selectedId = useMemo(
    () => (open && rows.some((r) => r.id === clickedId) ? clickedId : null),
    [open, rows, clickedId],
  );

  function taskText(id) {
    if (id == null) return '—';
    return tasks?.byId?.(id)?.text ?? String(id);
  }

  function itemTitle(row) {
    return row.typeKey ? _(row.typeKey) : '';
  }

  function focusTask(taskId) {
    if (!api || taskId == null) return;
    api.exec('select-task', { id: taskId, show: 'xy', focus: 'chart' });
  }

  function selectItem(row) {
    setClickedId(row.id);
    focusTask(taskIdFor(row));
  }

  function liveLink(row) {
    if (row.link == null) return null;
    return links?.byId?.(row.link);
  }

  function resolve(row, action) {
    if (!api) return;
    setClickedId(row.id);
    const taskId = taskIdFor(row);
    switch (action) {
      case 'remove-link': {
        const link = liveLink(row);
        if (link?.id != null) api.exec('delete-link', { id: link.id });
        break;
      }
      case 'resolve': {
        if (taskId == null || !row.required) break;
        api.exec('update-task', {
          id: taskId,
          task: { start: row.required },
        });
        break;
      }
      case 'remove-constraint': {
        if (taskId == null) break;
        api.exec('update-task', {
          id: taskId,
          task: { constraint: null },
        });
        break;
      }
    }
  }

  function close() {
    api?.exec('show-conflicts', { mode: false });
    onClose?.();
  }

  function renderDetail(row) {
    if (row.type === 'link') {
      return (
        <DetailLine
          label={_('From link')}
          value={`${taskText(liveLink(row)?.source)} → ${taskText(row.task)}`}
        />
      );
    }
    const constraint = tasks?.byId?.(row.task)?.constraint;
    return (
      <>
        <DetailLine label={_('Task')} value={taskText(row.task)} />
        {constraint?.date ? (
          <DetailLine
            label={_(constraintLabels[constraint.type] || constraint.type)}
            value={dateFormat(constraint.date)}
          />
        ) : null}
      </>
    );
  }

  const content = open ? (
    <div className="wx-conflict-report wx-aaeNX0k4">
      <div
        className="wx-header wx-aaeNX0k4"
        style={{ height: (scaleHeight ?? 36) + 'px' }}
      >
        <div className="wx-title wx-aaeNX0k4">
          {_('Conflicts')}
          {rows.length ? (
            <span className="wx-count wx-aaeNX0k4">{rows.length}</span>
          ) : null}
        </div>
        <Icon css="wxi-close" onClick={close} />
      </div>

      {!rows.length ? (
        <div className="wx-empty wx-aaeNX0k4">
          <div className="wx-empty-title wx-aaeNX0k4">
            <span className="wx-check wx-aaeNX0k4" aria-hidden="true"></span>
            {_('No conflicts found')}
          </div>
        </div>
      ) : (
        <div className="wx-list wx-aaeNX0k4" role="list">
          {rows.map((row) => {
            const actions = actionsFor(row);
            const icon = typeIcons[row.type];
            const selected = selectedId === row.id;
            return (
              <div
                key={row.id}
                className={`wx-item wx-aaeNX0k4${selected ? ' wx-selected' : ''}`}
                role="listitem"
                data-id={row.id}
                onClick={() => selectItem(row)}
              >
                <div className="wx-item-title wx-aaeNX0k4">
                  <span className="wx-type-icon wx-aaeNX0k4">
                    {icon ? <i className={`${icon} wx-aaeNX0k4`}></i> : null}
                  </span>
                  <span className="wx-item-title-text wx-aaeNX0k4">
                    {itemTitle(row)}
                  </span>
                </div>

                <div className="wx-item-detail wx-aaeNX0k4">
                  {renderDetail(row)}
                </div>
                {actions.length ? (
                  <div className="wx-item-actions wx-aaeNX0k4">
                    {actions.map((action) => (
                      <Button
                        key={action.id}
                        type={selected ? 'primary' : undefined}
                        onClick={() => resolve(row, action.id)}
                      >
                        {_(action.label)}
                      </Button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  ) : null;

  if (!i18nCtx) {
    return <context.i18n.Provider value={l}>{content}</context.i18n.Provider>;
  }
  return content;
}

export default ConflictReport;
