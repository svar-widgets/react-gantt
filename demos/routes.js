import BasicInit from './cases/BasicInit.jsx';
import GanttProvider from './cases/GanttProvider.jsx';
import GanttBatchProvider from './cases/GanttBatchProvider.jsx';
import GanttBackend from './cases/GanttBackend.jsx';
import GanttExcelImport from './cases/GanttExcelImport.jsx';
import GanttScales from './cases/GanttScales.jsx';
import GanttGrid from './cases/GanttGrid.jsx';
import GanttNoGrid from './cases/GanttNoGrid.jsx';
import GanttFlexColumns from './cases/GanttFlexColumns.jsx';
import GanttReadOnly from './cases/GanttReadOnly.jsx';
import GanttPreventActions from './cases/GanttPreventActions.jsx';
import GanttForm from './cases/GanttForm.jsx';
import GanttSizes from './cases/GanttSizes.jsx';
import GanttMultiple from './cases/GanttMultiple.jsx';
import GanttPerformance from './cases/GanttPerformance.jsx';
import GanttDisplayMode from './cases/GanttDisplayMode.jsx';


import GanttTooltips from './cases/GanttTooltips.jsx';
import GanttToolbar from './cases/GanttToolbar.jsx';
import GanttToolbarCustom from './cases/GanttToolbarCustom.jsx';
import GanttToolbarButtons from './cases/GanttToolbarButtons.jsx';
import GanttText from './cases/GanttText.jsx';
import GanttLocale from './cases/GanttLocale.jsx';
import GanttStartEnd from './cases/GanttStartEnd.jsx';
import GanttScaleDate from './cases/GanttScaleDate.jsx';
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
import GanttFilter from './cases/GanttFilter.jsx';
import GanttFilterInline from './cases/GanttFilterInline.jsx';
import GanttFilterBuilder from './cases/GanttFilterBuilder.jsx';
import GanttFilterQuery from './cases/GanttFilterQuery.jsx';
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
  ['/performance/:skin', 'Performance', GanttPerformance, 'GanttPerformance'],

  { group: 'Timeline' },
  ['/sizes/:skin', 'Scale / cell sizes', GanttSizes, 'GanttSizes'],
  [
    '/cell-borders/:skin',
    'Chart cell borders',
    ChartCellBorders,
    'ChartBorders',
  ],
  ['/start-end/:skin', 'Start/end dates', GanttStartEnd, 'GanttStartEnd'],
  ['/scroll-date/:skin', 'Scroll to date', GanttScaleDate, 'GanttScaleDate'],
  ['/scales/:skin', 'Custom scales', GanttScales, 'GanttScales'],
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
  ['/zoom/:skin', 'Zoom', GanttZoom, 'GanttZoom'],
  ['/custom-zoom/:skin', 'Custom Zoom', GanttCustomZoom, 'GanttCustomZoom'],
  ['/holidays/:skin', 'Holidays', GanttHolidays, 'GanttHolidays'],

  { group: 'Grid' },
  [
    '/grid-fill-space-columns/:skin',
    'Flexible grid columns',
    GanttFlexColumns,
    'GanttFlexColumns',
  ],
  [
    '/grid-custom-columns/:skin',
    'Custom column content',
    GanttGrid,
    'GanttGrid',
  ],
  [
    '/display-mode/:skin',
    'Grid width and display',
    GanttDisplayMode,
    'GanttDisplayMode',
  ],
  ['/no-grid/:skin', 'No grid', GanttNoGrid, 'GanttNoGrid'],
  [
    '/header-menu/:skin',
    'Header menu to hide columns',
    HeaderMenu,
    'GridHeaderMenu',
  ],

  { group: 'Tasks' },
  ['/task-types/:skin', 'Task types', GanttTaskTypes, 'GanttTaskTypes'],
  ['/templates/:skin', 'Custom text', GanttText, 'GanttText'],
  ['/tooltips/:skin', 'Tooltips', GanttTooltips, 'GanttTooltips'],

  { group: 'Data operations' },
  [
    '/prevent-actions/:skin',
    'Prevent default UI actions',
    GanttPreventActions,
    'GanttPreventActions',
  ],
  [
    '/grid-inline-editors/:skin',
    'Edit tasks in grid',
    GridInlineEditors,
    'GridInlineEditors',
  ],
  ['/readonly/:skin', 'Readonly', GanttReadOnly, 'GanttReadOnly'],
  [
    '/filtering/:skin',
    'Filter tasks in grid',
    GanttFilterInline,
    'GanttFilterInline',
  ],
  [
    '/filtering-api/:skin',
    'External filter controls',
    GanttFilter,
    'GanttFilter',
  ],
  [
    '/filtering-builder/:skin',
    'Integration with Filter Builder',
    GanttFilterBuilder,
    'GanttFilterBuilder',
  ],
  [
    '/filtering-query/:skin',
    'Integration with Filter Query',
    GanttFilterQuery,
    'GanttFilterQuery',
  ],
  ['/sorting/:skin', 'External sort controls', GanttSort, 'GanttSort'],
  ['/sorting-api/:skin', 'Sort by API', GanttCustomSort, 'GanttCustomSort'],

  { group: 'Scheduling' },


  { group: 'Load & Save' },
  ['/backend/:skin', 'Load from backend', GanttBackend, 'GanttBackend'],
  [
    '/backend-provider/:skin',
    'Save to backend',
    GanttProvider,
    'GanttProvider',
  ],
  [
    '/backend-provider-batch/:skin',
    'Save to backend: batch request',
    GanttBatchProvider,
    'GanttBatchProvider',
  ],
  [
    '/excel-import/:skin',
    'Import from Excel / CSV',
    GanttExcelImport,
    'GanttExcelImport',
  ],

  { group: 'UI / Layout' },
  ['/toolbar/:skin', 'Toolbar: basic', GanttToolbar, 'GanttToolbar'],
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
  ['/context-menu/:skin', 'Context menu: basic', ContextMenu, 'ContextMenu'],
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
  ['/editor/:skin', 'Editor: basic', GanttEditor, 'GanttEditor'],
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
  ['/custom-edit-form/:skin', 'Custom edit dialog', GanttForm, 'GanttForm'],

  { group: 'Appearance' },
  [
    '/gantt-multiple/:skin',
    'Many Gantts per page',
    GanttMultiple,
    'GanttMultiple',
  ],
  ['/fullscreen/:skin', 'Fullscreen', GanttFullscreen, 'GanttFullscreen'],
  ['/locale/:skin', 'Locales', GanttLocale, 'GanttLocale'],
];
