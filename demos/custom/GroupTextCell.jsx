import { useContext, useMemo } from 'react';
import { context } from '@svar-ui/react-core';
import { useStore } from '@svar-ui/lib-react';
import storeContext from '../../src/context.js';
import './GroupTextCell.css';

export default function GroupTextCell({ row }) {
  const i18n = useContext(context.i18n);
  const _ = useMemo(() => i18n.getGroup('gantt'), [i18n]);

  const api = useContext(storeContext);
  const groupBy = useStore(api, 'groupBy');

  const priorityMap = { 1: 'low', 2: 'medium', 3: 'high' };

  const isGroup = useMemo(() => groupBy?.field && row.$group, [groupBy, row]);

  const groupValue = useMemo(() => {
    let value = row.$groupValue;
    if (value && groupBy?.field === 'priority') {
      value = priorityMap[value];
    }
    return value;
  }, [groupBy, row]);

  if (isGroup) {
    if (row.$groupValue === '$ungrouped') {
      return _('Ungrouped');
    }
    return (
      <div className="group">
        {groupBy.field}: {groupValue}
      </div>
    );
  }

  return row.text;
}
