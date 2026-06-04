import { useState, useEffect, useMemo, useContext } from 'react';
import { dateToString } from '@svar-ui/lib-dom';
import { prepareEditTask } from '@svar-ui/gantt-store';
import { tempID } from '@svar-ui/lib-state';
import { context } from '@svar-ui/react-core';
import { useStore } from '@svar-ui/lib-react';
import GridSection from './GridSection.jsx';
import ActionCell from '../grid/ActionCell.jsx';
import './Segments.css';

export default function Segments({ api, autoSave, segments, onExtChange }) {
  const onChange = onExtChange;

  const l = useContext(context.i18n);
  const _ = useMemo(() => l.getGroup('gantt'), [l]);
  const dateFormat = useMemo(() => {
    const i18nData = l.getRaw();
    const f = i18nData.gantt?.dateFormat || i18nData.formats?.dateFormat;
    return dateToString(f, i18nData.calendar);
  }, [l]);

  const _activeTask = useStore(api, '_activeTask');

  const [segmentsState, setSegmentsState] = useState([]);

  function getSegmentsData() {
    if (!_activeTask || segments === null) return [];
    return segments
      ? [...segments]
      : _activeTask?.segments?.map((s) => ({
          ...s,
          id: s.id || tempID(),
        }));
  }

  useEffect(() => {
    setSegmentsState(getSegmentsData());
  }, [_activeTask, segments]);

  const columns = useMemo(() => {
    return [
      {
        id: 'text',
        header: _('Name'),
        type: 'string',
        flexgrow: 3,
        editor: 'text',
      },
      {
        id: 'start',
        header: _('Start'),
        flexgrow: 2,
        template: (v) => dateFormat(v),
        editor: 'datepicker',
      },
      {
        id: 'duration',
        header: _('Duration'),
        flexgrow: 2,
        editor: {
          type: 'text',
          config: { type: 'number' },
        },
      },
      {
        id: 'delete',
        header: '',
        cell: ActionCell,
        width: 50,
        align: 'center',
      },
    ];
  }, [_, dateFormat]);

  const [gridApi, setGridApi] = useState(null);

  function onInit(t) {
    setGridApi(t);
  }

  function getActionData(evData) {
    return {
      view: 'segments',
      event: evData,
      values: {
        segments: segmentsState.length ? [...segmentsState] : null,
      },
    };
  }

  function deleteSegment(id) {
    const index = segmentsState.findIndex((s) => s.id === id);
    const next = segmentsState.filter((s, i) => i !== index);
    setSegmentsState(next);

    const update = {
      id: _activeTask.id,
      task: {
        segments: next.length ? [...next] : null,
      },
    };
    if (autoSave) {
      api.exec('update-task', update);
    } else {
      onChange &&
        onChange(
          getActionData({
            id,
            action: 'update-task',
            data: update,
          }),
        );
    }
  }

  function onAction(id, action) {
    if (action === 'delete') deleteSegment(id);
  }

  function onEdit(id, column, value) {
    const { data } = gridApi.getState();
    let index = data.findIndex((s) => s.id === id);
    if (column === 'duration') value = value * 1;
    const segment = { ...segmentsState[index], [column]: value };
    prepareEditTask(
      segment,
      api.getState(),
      api.getTaskCalendar(_activeTask),
      column,
    );
    const update = {
      id: _activeTask.id,
      segmentIndex: index,
      task: segment,
    };

    if (autoSave) {
      api.exec('update-task', update);
    } else {
      setSegmentsState((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...segment } : s)),
      );
      onChange &&
        onChange(
          getActionData({
            id,
            action: 'update-task',
            data: update,
          }),
        );
    }
  }

  return (
    <div className="wx-section wx-aabvtaY1">
      {segmentsState.length ? (
        <GridSection
          columns={columns}
          onInit={onInit}
          onAction={onAction}
          data={segmentsState}
          onEdit={onEdit}
        />
      ) : (
        <div className="wx-nodata wx-aabvtaY1">{_('No segments')}</div>
      )}
    </div>
  );
}
