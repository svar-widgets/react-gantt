import type {
  FC,
  ReactNode,
  ComponentProps,
  ForwardRefExoticComponent,
  RefAttributes,
} from 'react';
import { ContextMenu as BaseContextMenu } from '@svar-ui/react-menu';
import { Toolbar as BaseToolbar } from '@svar-ui/react-toolbar';
import { Editor as BaseEditor } from '@svar-ui/react-editor';
import {
  HeaderMenu as BaseHeaderMenu,
  IColumnConfig as ITableColumn,
} from '@svar-ui/react-grid';

import type {
  TMethodsConfig,
  IApi,
  IConfig,
  ITask,
  ILink,
  IResource,
  IGanttColumn,
  IResourceColumn,
  IResourceLoad,
  IResourceHistogramConfig,
  IResourceHistogramTooltip,
  ISCurveTooltip,
  TID,
} from '@svar-ui/gantt-store';

export * from '@svar-ui/gantt-store';
export { registerEditorItem } from '@svar-ui/react-editor';

export declare const version: string;

export interface ILocatedTask {
  id: TID;
  node: Element;
}

export declare function locateTask(
  ev:
    | MouseEvent
    | DragEvent
    | { target?: EventTarget | null; clientY?: number },
  api?: IApi,
): ILocatedTask | null;

export interface IColumnConfig extends Omit<IGanttColumn, 'header'> {
  cell?: ITableColumn['cell'];
  header?: ITableColumn['header'];
  editor?: ITableColumn['editor'];
}

export declare const Gantt: ForwardRefExoticComponent<
  {
    columns?: false | IColumnConfig[];
    taskTemplate?: FC<{
      data: ITask;
      api: IApi;
      onAction: (ev: { action: string; data: { [key: string]: any } }) => void;
    }>;
    readonly?: boolean;
    cellBorders?: 'column' | 'full';
    highlightTime?: (date: Date, unit: 'day' | 'hour') => string;
    init?: (api: IApi) => void;
  } & Omit<IConfig, 'columns'> &
    GanttActions<TMethodsConfig> &
    RefAttributes<IApi>
>;

export declare const HeaderMenu: FC<
  ComponentProps<typeof BaseHeaderMenu> & {
    api?: IApi;
  }
>;

export declare const ContextMenu: ForwardRefExoticComponent<
  ComponentProps<typeof BaseContextMenu> & {
    api?: IApi;
  } & RefAttributes<{
      show: (ev?: MouseEvent | null, obj?: any) => void;
    }>
>;

export declare const Toolbar: FC<
  ComponentProps<typeof BaseToolbar> & {
    api?: IApi;
  }
>;

export declare const Editor: FC<
  ComponentProps<typeof BaseEditor> & {
    api?: IApi;
  }
>;

type TooltipContentData =
  | { task: ITask; segmentIndex: number | null; violated?: boolean }
  | { constraint: ITask; violated?: boolean }
  | { link: ILink }
  | { rollup: ITask }
  | { resource: IResource }
  | { histogram: IResourceHistogramTooltip }
  | { sCurve: ISCurveTooltip }
  | { deadline: ITask };

export declare const Tooltip: FC<{
  content?: FC<{
    api: IApi;
    data: TooltipContentData;
  }>;
  api?: IApi;
  children?: ReactNode;
}>;

export declare const ResourceLoad: FC<{
  api?: IApi;
  columns?: false | IResourceColumn[];
  mode?: 'utilization' | 'histogram';
  histogram?: IResourceHistogramConfig;
  template?: (load: IResourceLoad) => string;
  draggableRows?: boolean | ((row: IResource) => boolean);
}>;

export declare const ConflictReport: FC<{
  api?: IApi;
  onClose?: () => void;
}>;

export declare const Material: FC<{
  fonts?: boolean;
  children?: ReactNode;
}>;

export declare const Willow: FC<{
  fonts?: boolean;
  children?: ReactNode;
}>;

export declare const WillowDark: FC<{
  fonts?: boolean;
  children?: ReactNode;
}>;

/* get component events from store actions*/
type RemoveHyphen<S extends string> = S extends `${infer Head}-${infer Tail}`
  ? `${Head}${RemoveHyphen<Tail>}`
  : S;

type EventName<K extends string> = `on${RemoveHyphen<K>}`;

export type GanttActions<TMethodsConfig extends Record<string, any>> = {
  [K in keyof TMethodsConfig as EventName<K & string>]?: (
    ev: TMethodsConfig[K],
  ) => void;
} & {
  [key: `on${string}`]: (ev?: any) => void;
};
