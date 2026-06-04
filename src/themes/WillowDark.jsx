import { WillowDark as WillowDarkCore } from '@svar-ui/react-core';
import { WillowDark as GridWillowDark } from '@svar-ui/react-grid';
import './WillowDark.css';

export default function WillowDark({ fonts = true, children }) {
  if (children) {
    return (
      <WillowDarkCore fonts={fonts}>
        <GridWillowDark>{children}</GridWillowDark>
      </WillowDarkCore>
    );
  } else {
    return (
      <>
        <GridWillowDark fonts={fonts} />
        <WillowDarkCore fonts={fonts} />
      </>
    );
  }
}
