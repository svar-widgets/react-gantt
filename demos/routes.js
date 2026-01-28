import BasicInit from './cases/BasicInit.jsx';
import GanttProvider from './cases/GanttProvider.jsx';
import GanttBatchProvider from './cases/GanttBatchProvider.jsx';
import GanttBackend from './cases/GanttBackend.jsx';
import GanttScales from './cases/GanttScales.jsx';
import GanttGrid from './cases/GanttGrid.jsx';
import GanttNoGrid from './cases/GanttNoGrid.jsx';
import GanttFixedColumns from './cases/GanttFixedColumns.jsx';
import GanttFlexColumns from './cases/GanttFlexColumns.jsx';
import GanttReadOnly from './cases/GanttReadOnly.jsx';
import GanttPreventActions from './cases/GanttPreventActions.jsx';
import GanttForm from './cases/GanttForm.jsx';
import GanttSizes from './cases/GanttSizes.jsx';
import GanttMultiple from './cases/GanttMultiple.jsx';
import GanttPerformance from './cases/GanttPerformance.jsx';


import GanttTooltips from './cases/GanttTooltips.jsx';
import GanttToolbar from './cases/GanttToolbar.jsx';
import GanttToolbarCustom from './cases/GanttToolbarCustom.jsx';
import GanttToolbarButtons from './cases/GanttToolbarButtons.jsx';
import GanttText from './cases/GanttText.jsx';
import GanttLocale from './cases/GanttLocale.jsx';
import GanttStartEnd from './cases/GanttStartEnd.jsx';
import GanttFullscreen from './cases/GanttFullscreen.jsx';
import GanttZoom from './cases/GanttZoom.jsx';
import GanttCustomZoom from './cases/GanttCustomZoom.jsx';
import GanttLengthUnit from './cases/GanttLengthUnit.jsx';
import GanttTaskTypes from './cases/GanttTaskTypes.jsx';
import ChartCellBorders from './cases/ChartBorders.jsx';
import ContextMenu from './cases/ContextMenu.jsx';
import ContextMenuHandler from './cases/ContextMenuHandler.jsx';
//import DropDownMenu from "./cases/DropDownMenu.jsx";
import ContextMenuOptions from './cases/ContextMenuOptions.jsx';
import GanttHolidays from './cases/GanttHolidays.jsx';
import GanttSort from './cases/GanttSort.jsx';
import GanttCustomSort from './cases/GanttCustomSort.jsx';
import SummariesProgress from './cases/ProSummariesProgress.jsx';
import SummariesConvert from './cases/ProSummariesConvert.jsx';
import GanttEditor from './cases/GanttEditor.jsx';
import GanttEditorConfig from './cases/GanttEditorConfig.jsx';
import GanttEditorCustomControls from './cases/GanttEditorCustomControls.jsx';
import GanttEditorComments from './cases/GanttEditorComments.jsx';
import GanttEditorTasks from './cases/GanttEditorTasks.jsx';
import GanttScaleUnit from './cases/GanttScaleUnit.jsx';
import GanttDurationUnitHour from './cases/GanttDurationUnitHour.jsx';
import GanttDurationUnitChanges from './cases/GanttDurationUnitChanges.jsx';
import GanttMinScaleUnit from './cases/GanttMinScaleUnit.jsx';
import HeaderMenu from './cases/GridHeaderMenu.jsx';
import GridInlineEditors from './cases/GridInlineEditors.jsx';
import GanttEditorReadonly from './cases/GanttEditorReadonly.jsx';
import GanttEditorValidation from './cases/GanttEditorValidation.jsx';

export const links = [
  ['/base/:skin', 'Basic Gantt', BasicInit, 'BasicInit'],

  ['/sizes/:skin', 'Scale / cell sizes', GanttSizes, 'GanttSizes'],
  [
    '/cell-borders/:skin',
    'Chart cell borders',
    ChartCellBorders,
    'ChartBorders',
  ],
  ['/scales/:skin', 'Custom scales', GanttScales, 'GanttScales'],
  ['/start-end/:skin', 'Start/end dates', GanttStartEnd, 'GanttStartEnd'],
  [
    '/custom-scale/:skin',
    'Custom scale unit',
    GanttScaleUnit,
    'GanttScaleUnit',
  ],
  [
    '/custom-min-scale/:skin',
    'Custom minimal scale unit',
    GanttMinScaleUnit,
    'GanttMinScaleUnit',
  ],

  ['/holidays/:skin', 'Holidays', GanttHolidays, 'GanttHolidays'],


  ['/templates/:skin', 'Custom text', GanttText, 'GanttText'],
  ['/tooltips/:skin', 'Tooltips', GanttTooltips, 'GanttTooltips'],

  ['/task-types/:skin', 'Task types', GanttTaskTypes, 'GanttTaskTypes'],

  ['/zoom/:skin', 'Zoom', GanttZoom, 'GanttZoom'],
  ['/custom-zoom/:skin', 'Custom Zoom', GanttCustomZoom, 'GanttCustomZoom'],
  [
    '/length-unit/:skin',
    'Length unit (rounding)',
    GanttLengthUnit,
    'GanttLengthUnit',
  ],
  [
    '/duration-unit/:skin',
    'Duration unit: hour',
    GanttDurationUnitHour,
    'GanttDurationUnitHour',
  ],
  [
    '/duration-changes/:skin',
    'Duration unit: changes',
    GanttDurationUnitChanges,
    'GanttDurationUnitChanges',
  ],
  ['/no-grid/:skin', 'No grid', GanttNoGrid, 'GanttNoGrid'],
  [
    '/grid-fill-space-columns/:skin',
    'Flexible grid columns',
    GanttFlexColumns,
    'GanttFlexColumns',
  ],
  [
    '/grid-fixed-columns/:skin',
    'Fixed grid columns',
    GanttFixedColumns,
    'GanttFixedColumns',
  ],
  ['/grid-custom-columns/:skin', 'Custom grid columns', GanttGrid, 'GanttGrid'],
  [
    '/grid-inline-editors/:skin',
    'Grid inline editors',
    GridInlineEditors,
    'GridInlineEditors',
  ],

  ['/toolbar/:skin', 'Toolbar', GanttToolbar, 'GanttToolbar'],
  [
    '/toolbar-buttons/:skin',
    'Toolbar: limited buttons',
    GanttToolbarButtons,
    'GanttToolbarButtons',
  ],
  [
    '/toolbar-custom/:skin',
    'Toolbar: custom buttons',
    GanttToolbarCustom,
    'GanttToolbarCustom',
  ],
  ['/context-menu/:skin', 'Context menu', ContextMenu, 'ContextMenu'],
  [
    '/menu-handler/:skin',
    'Context menu: limiting options',
    ContextMenuHandler,
    'ContextMenuHandler',
  ],
  //["/outer-menu/:skin", "Dropdown menu", DropDownMenu, "DropDownMenu"],
  [
    '/menu-options/:skin',
    'Context menu: custom options',
    ContextMenuOptions,
    'ContextMenuOptions',
  ],
  [
    '/header-menu/:skin',
    'Header menu: hiding columns',
    HeaderMenu,
    'GridHeaderMenu',
  ],
  ['/locale/:skin', 'Locales', GanttLocale, 'GanttLocale'],
  ['/fullscreen/:skin', 'Fullscreen', GanttFullscreen, 'GanttFullscreen'],
  ['/readonly/:skin', 'Readonly mode', GanttReadOnly, 'GanttReadOnly'],
  [
    '/gantt-multiple/:skin',
    'Many Gantts per page',
    GanttMultiple,
    'GanttMultiple',
  ],
  ['/performance/:skin', 'Performance', GanttPerformance, 'GanttPerformance'],
  [
    '/prevent-actions/:skin',
    'Preventing UI actions',
    GanttPreventActions,
    'GanttPreventActions',
  ],
  ['/sorting/:skin', 'Custom sorting', GanttSort, 'GanttSort'],
  ['/sorting-api/:skin', 'Sort by API', GanttCustomSort, 'GanttCustomSort'],

  ['/backend/:skin', 'Backend data', GanttBackend, 'GanttBackend'],
  [
    '/backend-provider/:skin',
    'Saving to backend',
    GanttProvider,
    'GanttProvider',
  ],
  [
    '/backend-provider-batch/:skin',
    'Saving to backend: batch request',
    GanttBatchProvider,
    'GanttBatchProvider',
  ],
  ['/editor/:skin', 'Editor', GanttEditor, 'GanttEditor'],
  [
    '/editor-config/:skin',
    'Editor: custom settings',
    GanttEditorConfig,
    'GanttEditorConfig',
  ],
  [
    '/editor-custom-controls/:skin',
    'Editor: custom controls',
    GanttEditorCustomControls,
    'GanttEditorCustomControls',
  ],
  [
    '/editor-comments/:skin',
    'Editor: custom comments',
    GanttEditorComments,
    'GanttEditorComments',
  ],
  [
    '/editor-tasks/:skin',
    'Editor: custom tasks',
    GanttEditorTasks,
    'GanttEditorTasks',
  ],
  [
    '/editor-readonly/:skin',
    'Editor: readonly',
    GanttEditorReadonly,
    'GanttEditorReadonly',
  ],
  [
    '/editor-validation/:skin',
    'Editor: validation',
    GanttEditorValidation,
    'GanttEditorValidation',
  ],
  ['/custom-edit-form/:skin', 'Custom edit form', GanttForm, 'GanttForm'],
];
