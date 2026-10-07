import { useContext, useMemo } from 'react';
import { DatePicker, TimePicker, context } from '@svar-ui/react-core';
import './DateTimePicker.css';

export default function DateTimePicker(props) {
  const {
    value,
    time,
    format,
    onchange,
    onChange,
    buttons: buttonsProp,
    clear,
    ...restProps
  } = props;
  const onChangeHandler = onChange ?? onchange;

  const i18n = useContext(context.i18n);
  const _ = useMemo(() => i18n.getGroup('gantt'), [i18n]);

  const buttons = useMemo(() => buttonsProp || ['today'], [buttonsProp]);
  const localizedButtons = useMemo(
    () => buttons.map((b) => _(b)),
    [buttons, _],
  );

  function handleDateChange(ev) {
    let current = ev.value;
    if (current) {
      current = new Date(ev.value);
      if (value) {
        current.setHours(value.getHours());
        current.setMinutes(value.getMinutes());
      }
    }

    onChangeHandler && onChangeHandler({ value: current });
  }

  return (
    <div className="wx-hFsbgDln date-time-controll">
      <DatePicker
        {...restProps}
        value={value}
        onChange={handleDateChange}
        format={format}
        buttons={localizedButtons}
        clear={clear ?? buttons.includes('Unschedule')}
      />
      {time ? (
        <TimePicker value={value} onChange={onChangeHandler} format={format} />
      ) : null}
    </div>
  );
}
