## 2.5.1

### New features

- Server-side export to PNG, PDF, XLSX, MS Project | PRO feature
- Client-side export and import from MS Project | PRO feature
- Auto calculation of progress for summary tasks | PRO feature
- Auto conversion of parent tasks to summary tasks | PRO feature

### Fixes

- Scale is expanded left with a small dataset during screen resizing
- Markers ignore scale boundaries
- Delete link placeholder is misplaced sometimes
- Task duration and start date and incorrect during drag-n-drop on some scales

## Version 2.4.5

### Fixes

- Incorrect path to fonts and icons

## Version 2.4.4

### Fixes

- Splitting a task is limited to last segment

## Version 2.4.3

Community license changed from GPL to MIT

### New features

- Basic auto scheduling | PRO feature
- Handling of invalid links | PRO feature
- Critical path calculation | PRO feature
- Global calendar to define working schedule | PRO feature
- Unscheduled tasks | PRO feature
- Vertical markers on timeline | PRO feature
- Baselines | PRO feature
- Split tasks | PRO feature
- Undo/redo | PRO feature
- Ability to remove links from Chart UI
- Locale-based scale formatting

### Updates

- Resizer line can be dragged to expand current display mode

### Fixes

- Summary task size is sometimes incorrect while dragging
- ContextMenu css cannot be set
- Editing tasks breakes dynamic width of narrow scales cells

### Breaking changes

- Scales format string is changed from date-fns to SVAR locale
- Fullscreen helper is moved to SVAR Svelte Core

## Version 2.3.4

### Fixes

- Performance regression during scrolling and zooming

## Version 2.3.3

### Fixes

- Fullscreen hotkey property should be optional
- Incorrect handling of themes
- ContextMenu custom class name cannot be set

## Version 2.3.2

### Fixes

- Tooltips for bars are not visible

## Version 2.3

### New features

- TypeScript definitions
- Ability to define "hour" duration unit
- Ability to define "minute" length unit
- Ability to create custom scale units
- `autoScale` property to configure start/end scale behaviour
- Standalone sidebar and modal Editor
- Ability to validate fields in the Editor
- Hotkeys for common actions and navigation
- Multi-sorting for table columns via the sort-tasks action
- Headermenu to hide table columns
- Inline editors for table cells
- Ability to expand/collapse table and chart via buttons

### Breaking changes

- The package migrated from wx-react-gantt to @svar-ui/react-gantt

## Version 1.3.1

### Fixes

- Rendering issues

## Version 1.3

- Released under GPLv3

## Version 1.1

### New features

- Summary tasks
- Sorting Grid columns
- Batch mode for RestDataProvider to handle mass operations

### Updates

- Common minCellwidth and maxCellWidth for zoom levels
- Skipping meaningless actions in Context Menu and Toolbar

### Fixes

- Scroll in Grid is not smooth
- Impossible to resize chart bars on the left more than for one cell
- When a branch is removed, only links of the parent task are removed
- Unstable move down behaviour: tasks are inserted in wrong positions
- Resizing columns: horizontal scrollbar does not appear
- Text of tasks is higher than a dragged bar during reordering
- Last task is misplaced after reordering when there are few tasks
- Reordering of tasks with child tasks is broken
- Impossible to define cellWidth if default zoom is enabled
- Data is removed from the task object after the "update-task" operation
- Outdenting does not work for the 3rd-level tasks
- Auto scale is calculated incorrectly if the last task is a milestone
- Parent task is not always opened after adding a new task
- Task start date is not set according to the top-level target task
- Zooming in and out between levels does not work correctly

## Version 1.0

### Initial functionality

- Fast behavior and clear API
- Configurable Grid columns
- Configurable Chart scales and cell sizes
- Task types: "project", "task", "milestone" and custom
- Baselines
- Holiday and custom markers in the Chart area
- Configurable Editor panel
- Configurable Context Menu and Toolbar
- Tooltips for tasks in the Chart area
- Readonly mode
- Fullscreen mode
- Mouse-wheel zooming in the Chart area
- Responsive behaviour of the Grid area
- Localization of labels and dates
- Ready-made DataProvider to integrate with server
