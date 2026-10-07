import { useState, useEffect } from 'react';
import { HeaderMenu as HeaderMenuInner } from '@svar-ui/react-grid';

const HeaderMenu = ({ children, columns = null, api }) => {
  const [targetSection, setTargetSection] = useState('grid');
  const [tableAPI, setTableAPI] = useState(null);
  useEffect(() => {
    if (!api) return;
    let active = true;
    api.getTable(true, targetSection).then((t) => {
      if (active) setTableAPI(t);
    });
    return () => {
      active = false;
    };
  }, [api, targetSection]);

  function detectSection(ev) {
    const host = ev.target?.closest?.('[data-gantt-section]');
    const section =
      host?.dataset.ganttSection === 'subGrid' ? 'subGrid' : 'grid';
    if (section !== targetSection) {
      // switch synchronously when the table is already rendered
      const t = api?.getTable(false, section);
      if (t) setTableAPI(t);
      setTargetSection(section);
    }
  }

  return (
    <HeaderMenuInner api={tableAPI} columns={columns}>
      <div style={{ display: 'contents' }} onContextMenu={detectSection}>
        {children}
      </div>
    </HeaderMenuInner>
  );
};

export default HeaderMenu;
