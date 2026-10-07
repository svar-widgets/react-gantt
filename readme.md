<div align="center">
	
# SVAR React Gantt Chart

[Website](https://svar.dev/react/gantt/) • [Getting Started](https://docs.svar.dev/react/gantt/getting_started/) • [Live Demos](https://docs.svar.dev/react/gantt/samples/)

[![npm](https://img.shields.io/npm/v/@svar-ui/react-gantt.svg)](https://www.npmjs.com/package/@svar-ui/react-gantt)
[![License](https://img.shields.io/github/license/svar-widgets/react-gantt)](https://github.com/svar-widgets/react-gantt/blob/main/license.txt)
[![npm downloads](https://img.shields.io/npm/dm/@svar-ui/react-gantt.svg)](https://www.npmjs.com/package/@svar-ui/react-gantt)

</div>

[SVAR React Gantt](https://svar.dev/react/gantt/) is a customizable, high-performance Gantt chart component written in React. It offers a developer-friendly API, full TypeScript support, React 19 compatibility, and flexible CSS styling.

The component supports multiple task types, dependencies, custom time scales, and light/dark themes. It is designed to handle thousands of tasks efficiently (see [demo with 10k tasks](https://docs.svar.dev/react/gantt/samples/#/performance/willow)).

<div align="center">
<img src="https://svar.dev/images/github/basic-gantt-react.gif" alt="SVAR React Gantt UI">
</div><br>

Interactive, drag-and-drop interface allows users to add, edit, and organize tasks and dependencies directly on the timeline or through a simple task edit form.

### ✨ Core Features

SVAR React Gantt gives you the baseline of project planning: an interactive timeline, a task grid, intuitive UI for task management, and backend bindings — typed end to end and ready for React 19 and Next.js.

**Timeline**
-   Interactive drag-and-drop timeline
-   Task and dependency visualization
-   Hierarchical view of subtasks
-   Task progress shown on taskbars
-   Configurable time scale: hours, days, weeks, sprints or stages
-   Flexible time units: hours and minutes
-   Weekend and holiday highlighting
-   Zooming with scroll
-   The ability to drag tasks from a backlog

**Grid**
-   Customizable grid columns
-   Sorting tasks in the grid
-   Reorder tasks in the grid
-   Task filtering, including natural language search
-   Custom HTML in grid cells
-   In-cell editing in the grid

**Task interaction**
-   Customizable task edit form
-   Toolbar and context menu
-   Tooltips for taskbars and links
-   Hotkeys for common actions

**Data & performance**
-   Virtualization for large data sets
-   Dynamic loading of sub-tasks
-   RestDataProvider for REST backend binding
-   Real-time updates from the server

**UI & tooling**
-   Light and dark themes
-   Localization
-   Full TypeScript support
-   [AI tools](https://docs.svar.dev/react/gantt/ai-tools/) for coding agents: MCP server, skills, and flat context files

### 🚀 PRO Edition

In addition to free, open-source core, SVAR React Gantt offers the PRO edition with additional features and automation logic:

**Scheduling & constraints**
-   Auto-scheduling: FS, SS, FF, SF, and lag
-   Constraints (6 types)
-   Critical path and deadlines
-   Manual and inactive tasks

**Calendars & resources**
-   Working time calendar (non-linear time scale), with individual calendars for tasks and resources
-   Resource-driven scheduling
-   Resource load chart and histogram
-   Drag-and-drop resource assignment

**Tracking**
-   Baselines, progress line, and S-curve
-   Slack (float) visualization

**Advanced task management**
-   Task grouping
-   Rollups
-   Split tasks
-   Summary tasks automation
-   Unscheduled tasks
-   WBS codes support

**Layout & data**
-   Sub-grid panel and placeholder row
-   Undo/redo
-   Vertical markers
-   Export to PDF, PNG, Excel (including resources and assignments)
-   MS Project import/export

Visit the [pricing page](https://svar.dev/react/gantt/pricing/) for full feature comparison and free trial.

[Check out the demos](https://docs.svar.dev/react/gantt/samples/) to see all SVAR React Gantt features in action.

### :hammer_and_wrench: How to Use

To start using **SVAR React Gantt**, simply import the package and include the desired component in your React file:

```jsx
import { Gantt } from '@svar-ui/react-gantt';
import '@svar-ui/react-gantt/all.css';

export default function MyComponent() {
  const tasks = [
    {
      id: 20,
      text: 'New Task',
      start: new Date(2024, 5, 11),
      end: new Date(2024, 6, 12),
      duration: 1,
      progress: 2,
      type: 'task',
      lazy: false,
    },
    {
      id: 47,
      text: '[1] Master project',
      start: new Date(2024, 5, 12),
      end: new Date(2024, 7, 12),
      duration: 8,
      progress: 0,
      parent: 0,
      type: 'summary',
    },
  ];

  return <Gantt tasks={tasks} />;
}
```

See the [getting started guide](https://docs.svar.dev/react/gantt/getting_started/) to learn how to configure data sources, customize columns, and enable editing.

You'll also find integration guides for:

- [Next.js demo](https://github.com/svar-widgets/react-gantt-demo-nextjs) & [guide](https://docs.svar.dev/react/gantt/category/nextjs/)
- State management: [Redux](https://docs.svar.dev/react/gantt/integration-guides/integration-redux/), [Zustand](https://docs.svar.dev/react/gantt/integration-guides/integration-zustand/), [MobX](https://docs.svar.dev/react/gantt/integration-guides/integration-mobx/), [XState](https://docs.svar.dev/react/gantt/integration-guides/integration-xstate/), [Jotai](https://docs.svar.dev/react/gantt/integration-guides/integration-jotai/)

### ⭐ Show Your Support

If SVAR React Gantt helps your project, consider [giving us a star](https://github.com/svar-widgets/react-gantt)! It helps other developers discover this library and motivates us to keep improving.

### :speech_balloon: Need Help?

[Post an Issue](https://github.com/svar-widgets/react-gantt/issues/) or use our [community forum](https://forum.svar.dev).
