import { useContext, useMemo } from 'react';
import { Avatar } from '@svar-ui/react-core';
import { useStore } from '@svar-ui/lib-react';
import storeContext from '../../context';
import './ResourcesCell.css';

function ResourcesCell({ row }) {
  const api = useContext(storeContext);
  const assignmentsVal = useStore(api, 'assignments');

  const assigned = useMemo(
    () => api.getTaskResources(row.$id || row.id),
    [api, assignmentsVal, row]
  );

  return (
    <div className="wx-aadpwBM9 wx-avatar">
      <Avatar value={assigned} size={28} />
    </div>
  );
}

export default ResourcesCell;
