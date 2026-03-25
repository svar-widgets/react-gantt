import { NavLink, useLocation } from 'react-router-dom';
import './Link.css';


function Link({ data, skin, onClick }) {
  const fullPath = data[0].replace(':skin', skin);
  const location = useLocation();
  const isActive = location.pathname.startsWith(fullPath);

  return (
    <NavLink
      to={fullPath}
      className={`wx-demos demo${isActive ? ' active' : ''}`}
      onClick={() => isActive && onClick?.()}
    >
      {data[1]}
      {data[4] && data[4].pro && <span className="pro">PRO</span>}
    </NavLink>
  );
}

export default Link;
