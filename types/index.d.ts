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
  IGanttColumn,
} from '@svar-ui/gantt-store';

export * from '@svar-ui/gantt-store';
export { registerEditorItem } from '@svar-ui/react-editor';

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
      onaction: (ev: { action: string; data: { [key: string]: any } }) => void;
    }>;
    readonly?: boolean;
    cellBorders?: 'column' | 'full';
    highlightTime?: (date: Date, unit: 'day' | 'hour') => string;
    init?: (api: IApi) => void;
  } & IConfig &
    GanttActions<TMethodsConfig> &
    RefAttributes<IApi>
>;

export declare const HeaderMenu: FC<
  ComponentProps<typeof BaseHeaderMenu> & {
    api?: IApi;
  }
>;

export declare const ContextMenu: FC<
  ComponentProps<typeof BaseContextMenu> & {
    api?: IApi;
  }
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

export declare const Tooltip: FC<{
  content?: FC<{
    data: ITask;
  }>;
  api?: IApi;
  children?: ReactNode;
}>;

export declare const Fullscreen: FC<{
  hotkey?: string;
  children?: ReactNode;
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
