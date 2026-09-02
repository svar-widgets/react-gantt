import { Willow as CoreWillow } from '@svar-ui/react-core';
import { Willow as GridWillow } from '@svar-ui/react-grid';
import './Willow.css';

function Willow({ fonts = true, children }) {
  return children ? (
    <CoreWillow fonts={fonts}>
      <GridWillow fonts={fonts}>{children}</GridWillow>
    </CoreWillow>
  ) : (
    <>
      <GridWillow fonts={fonts} />
      <CoreWillow fonts={fonts} />
    </>
  );
}

export default Willow;
