import { Position } from './../position';
export type FlatNode = {
  expandable: boolean;
  name: string;
  depth: number;
  withChevron?: boolean;
  iconClass?: string;
  iconPosition?: Position;
  onClick?: (...args: Array<string>) => void;
  id: string;
};
