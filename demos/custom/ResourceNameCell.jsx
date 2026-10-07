import { Avatar } from '@svar-ui/react-core';
import './ResourceNameCell.css';

function ResourceNameCell({ row }) {
  return (
    <div className="content wx-aaexLb8l">
      <Avatar value={row} size={28} />
      <div className="meta wx-aaexLb8l">
        <span className="name wx-aaexLb8l">{row.name}</span>
        <span className="detail wx-aaexLb8l">{row.role}</span>
      </div>
    </div>
  );
}

export default ResourceNameCell;
