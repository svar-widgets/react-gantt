import { useMemo } from 'react';
import { Avatar } from '@svar-ui/react-core';
import { users } from '../data';
import './AvatarCell.css';

function AvatarCell(props) {
  const { row, user } = props;

  const url = 'https://svar.dev/demos/grid/assets/avatars/';

  const userData = useMemo(
    () => (row ? users.find((u) => u.id == row.assigned) : user),
    [row, user],
  );

  const value = useMemo(() => {
    if (userData)
      userData.avatar = `${url}${(userData.label || '').replace(' ', '_')}.png`;
    return userData;
  }, [userData]);

  return (
    <div className="container">
      <Avatar value={value} />
      <div>{value?.label ?? ''}</div>
    </div>
  );
}

export default AvatarCell;
