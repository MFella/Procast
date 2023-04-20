import { Position } from './position';

export type SidebarConfig = {
  sections: Array<SidebarSection>;
  position: Position;
};

export type SidebarSection = {
  title: Uppercase<string>;
  withChevron: boolean;
  onClick: (...args: Array<unknown>) => void;
  options: Array<SidebarSectionOption>;
};

export type SidebarSectionOption = {
  title: Uppercase<string>;
  iconClass?: string;
  iconPosition?: Omit<Position, 'top' | 'bottom'>;
  onClick: (...args: Array<unknown>) => void;
};
