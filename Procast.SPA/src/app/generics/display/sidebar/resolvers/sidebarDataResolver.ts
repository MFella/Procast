import { SidebarConfig } from '../types/sidebarConfig';

export interface SidebarDataResolver {
  resolveSidebarData(): SidebarConfig;
}
