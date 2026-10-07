import { useContext, useMemo } from 'react';
import { RichSelect, context } from '@svar-ui/react-core';
import { defaultConstraintTypes } from '@svar-ui/gantt-store';
import DateTimePicker from './DateTimePicker.jsx';
import './Constraint.css';

const NONE = 'none';

const finishSide = (type) =>
  type === 'fnlt' || type === 'fnet' || type === 'mfo';

export default function Constraint({ value, onChange, task, config }) {
  const i18n = useContext(context.i18n);
  const _ = useMemo(() => i18n.getGroup('gantt'), [i18n]);

  const options = useMemo(
    () => [
      { id: NONE, label: _('None') },
      ...defaultConstraintTypes.map((t) => ({ ...t, label: _(t.label) })),
    ],
    [_],
  );

  const type = value?.type ?? NONE;

  // a milestone has a single start date
  function defaultDate(next) {
    if (finishSide(next) && task?.type !== 'milestone')
      return task?.end ?? task?.start;
    return task?.start;
  }

  function handleTypeChange(ev) {
    const next = ev.value;
    if (next === NONE) return onChange?.({ value: null });

    const keep = value?.date && finishSide(next) === finishSide(type);
    onChange?.({
      value: { type: next, date: keep ? value.date : defaultDate(next) },
    });
  }

  function handleDateChange(ev) {
    if (type === NONE || !ev.value) return;
    onChange?.({ value: { type, date: ev.value } });
  }

  return (
    <div className="wx-aadFov3V wx-constraint-editor">
      <RichSelect options={options} value={type} onChange={handleTypeChange} />
      {type !== NONE ? (
        <DateTimePicker
          value={value?.date}
          onChange={handleDateChange}
          format={config?.format}
        />
      ) : null}
    </div>
  );
}
