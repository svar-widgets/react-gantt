import { useState, useMemo } from 'react';
import { getRollupsData } from '../data';
import { Gantt, Editor, Tooltip } from '../../src/index.js';
import MyTooltipContent from '../custom/MyTooltipContent.jsx';
import { Field, Switch, RichSelect } from '@svar-ui/react-core';
import './ProRollups.css';

function ProRollups({ skinSettings }) {
  const data = useMemo(() => getRollupsData(), []);

  const [api, setApi] = useState();
  const [rollupsMode, setRollupsMode] = useState('closest');
  const [showBaseline, setShowBaseline] = useState(false);

  const options = [
    { id: 'all', label: 'All' },
    { id: 'closest', label: 'Closest' },
  ];

  return (
    <div className="rows wx-aabat62F">
      <div className="bar wx-aabat62F">
        <Field label="Show baselines" position={'left'}>
          <Switch
            value={showBaseline}
            onChange={({ value }) => setShowBaseline(value)}
          />
        </Field>
        <Field label="Rollups mode" position={'left'}>
          <RichSelect
            options={options}
            value={rollupsMode}
            onChange={({ value }) => setRollupsMode(value)}
          />
        </Field>
      </div>
      <div className="gtcell wx-aabat62F">
        <Tooltip api={api} content={MyTooltipContent}>
          <Gantt
            init={setApi}
            {...skinSettings}
            rollups={{ type: rollupsMode }}
            cellHeight={45}
            tasks={data.tasks}
            links={data.links}
            baselines={showBaseline}
          />
        </Tooltip>
        {api && <Editor api={api} />}
      </div>
    </div>
  );
}

export default ProRollups;
