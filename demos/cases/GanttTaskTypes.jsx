import { useMemo, useState } from 'react';
import { getTypedData, taskTypes } from '../data';
import { Gantt, Editor, ContextMenu } from '../../src/';
import './GanttTaskTypes.css';

function GanttTaskTypes(props) {
  const { skinSettings } = props;

  const data = useMemo(() => getTypedData(), []);
  const [api, setApi] = useState(null);

  return (
    <div className="wx-I1glfWSB demo">
      <ContextMenu api={api}>
        <Gantt
          init={setApi}
          {...skinSettings}
          tasks={data.tasks}
          links={data.links}
          scales={data.scales}
          taskTypes={taskTypes}
        />
      </ContextMenu>
      {api && <Editor api={api} />}
    </div>
  );
}

export default GanttTaskTypes;
