import { useEffect, useRef } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { links } from '../routes';

export default function Router({ onRouteChange }) {
  const location = useLocation();
  const navigate = useNavigate();

  const lastRef = useRef(location.pathname);
  useEffect(() => {
    if (lastRef.current === location.pathname) return;
    if (location.pathname === '/') {
      navigate('/base/willow', { replace: true });
    } else {
      onRouteChange(location.pathname);
    }
  }, [location.pathname, onRouteChange, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/base/willow" replace />} />
      {links
        .filter((a) => Array.isArray(a))
        .map(([path, , Component]) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
    </Routes>
  );
}
