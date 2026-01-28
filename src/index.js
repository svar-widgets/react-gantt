import Gantt from './components/Gantt.jsx';
import Toolbar from './components/Toolbar.jsx';
import ContextMenu from './components/ContextMenu.jsx';
import Editor from './components/Editor.jsx';
import HeaderMenu from './components/grid/HeaderMenu.jsx';

import Tooltip from './widgets/Tooltip.jsx';

import Material from './themes/Material.jsx';
import Willow from './themes/Willow.jsx';
import WillowDark from './themes/WillowDark.jsx';

import pkg from '../package.json' with { type: 'json' };

export {
  defaultEditorItems,
  defaultToolbarButtons,
  defaultMenuOptions,
  defaultColumns,
  defaultTaskTypes,
  getEditorItems,
  getToolbarButtons,
  getMenuOptions,
  registerScaleUnit,
} from '@svar-ui/gantt-store';

export { registerEditorItem } from '@svar-ui/react-editor';

export const version = pkg.version;

export {
  Gantt,
  ContextMenu,
  HeaderMenu,
  Toolbar,
  Tooltip,
  Editor,
  Material,
  Willow,
  WillowDark,
};
