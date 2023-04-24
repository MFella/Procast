import { Position } from './position';

export type SidebarConfig = {
  sections: Array<SidebarSection>;
  position: Position;
};

export type SidebarSection = {
  title: Uppercase<string>;
  withChevron: boolean;
  onClick: (...args: Array<string>) => void;
  options: Array<SidebarSectionOption>;
  id: string;
};

export type SidebarSectionOption = {
  title: Uppercase<string>;
  iconClass?: string;
  iconPosition?: Omit<Position, 'top' | 'bottom'>;
  onClick: (...args: Array<string>) => void;
  id: string;
};
