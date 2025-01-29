import { createActionGroup, props } from '@ngrx/store';
import { SidebarConfig } from '../../_typings/workspace/sidebar-config.typings';

export const sidebarConfigActions = createActionGroup({
  source: 'Sidebar Config',
  events: {
    Update: props<{
      sidebarConfig: Partial<SidebarConfig>;
    }>(),
  },
});
