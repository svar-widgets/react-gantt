import { useState, useMemo } from 'react';
import { getData } from '../data';
import { Gantt, HeaderMenu } from '../../src/';
import { RadioButtonGroup } from '@svar-ui/react-core';
import './GridHeaderMenu.css';

function GridHeaderMenu({ skinSettings }) {
  const data = useMemo(() => getData(), []);

  const [api, setApi] = useState(null);

  const [selected, setSelected] = useState('all');
  const options = [
    { id: 'all', label: 'All' },
    { id: 'some', label: 'Some' },
  ];
  const hidable = { start: true, duration: true };

  const columns = useMemo(
    () => (selected === 'some' ? hidable : null),
    [selected],
  );

  return (
    <div className="wx-DZzpn0qn rows">
      <div className="wx-DZzpn0qn bar">
        <div className="wx-DZzpn0qn hint">
          Right-click the grid header and select visible columns
        </div>
        <div className="wx-DZzpn0qn bar">
          <div className="wx-DZzpn0qn label">Columns that can be hidden:</div>
          <RadioButtonGroup
            options={options}
            value={selected}
            onChange={({ value }) => setSelected(value)}
            type="inline"
          />
        </div>
      </div>
      <div className="wx-DZzpn0qn gtcell">
        <HeaderMenu api={api} columns={columns}>
          <Gantt
            init={setApi}
            {...skinSettings}
            tasks={data.tasks}
            links={data.links}
            scales={data.scales}
          />
        </HeaderMenu>
      </div>
    </div>
  );
}

export default GridHeaderMenu;
