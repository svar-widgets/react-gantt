import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './common/Index.jsx';

import { Globals, Button, Segmented } from '@svar-ui/react-core';

import Willow from '../src/themes/Willow.jsx';
import WillowDark from '../src/themes/WillowDark.jsx';
import { WillowIcon, WillowDarkIcon } from './assets/icons/index';

import '@svar-ui/react-core/style.css';
import '@svar-ui/react-grid/style.css';
import '@svar-ui/react-editor/style.css';
import '@svar-ui/react-menu/style.css';
import '@svar-ui/react-toolbar/style.css';
import '@svar-ui/react-comments/style.css';
import '@svar-ui/react-tasklist/style.css';
import '@svar-ui/react-filter/style.css';

const skins = [
  { id: 'willow', label: 'Willow', Component: Willow, icon: WillowIcon },
  { id: 'willow-dark', label: 'Dark', Component: WillowDark, icon: WillowDarkIcon },
];

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App
      publicName="Gantt"
      skins={skins}
      productTag="gantt"
      Globals={Globals}
      Button={Button}
      Segmented={Segmented}
    />
  </React.StrictMode>,
);
