import { useContext } from 'react';
import { setID } from '@svar-ui/lib-dom';
import { useStore } from '@svar-ui/lib-react';
import storeContext from '../../context';

function Rollups(props) {
  const { rollup, parent } = props;

  const api = useContext(storeContext);
  const inactiveTasks = useStore(api, 'inactiveTasks');

  return (
    <div
      data-rollup-id={setID(rollup.id)}
      className={`wx-GKbcLEGA wx-rollup wx-${rollup.type}-rollup${inactiveTasks && parent.inactive ? ' wx-inactive' : ''}`}
      style={{
        left: `${rollup.$x_rollup}px`,
        top: `${parent.$y + parent.$h + rollup.$y_rollup_relative}px`,
        width: `${rollup.$w_rollup}px`,
        height: `${rollup.$h_rollup}px`,
      }}
    ></div>
  );
}

export default Rollups;
