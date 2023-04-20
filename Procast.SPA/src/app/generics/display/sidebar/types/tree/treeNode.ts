import { Position } from './../position';
export type TreeNode = {
  name: string;
  withChevron?: boolean;
  iconClass?: string;
  iconPosition?: Position;
  onClick: (...args: Array<unknown>) => void;
  children?: TreeNode[];
};
