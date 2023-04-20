import { TreeNode } from './../../../generics/display/sidebar/types/tree/treeNode';
import { Observable } from 'rxjs';
import { FlatNode } from './../../../generics/display/sidebar/types/tree/flatNode';

export type MatTreeFlatConfig = {
  getDepth: (node: FlatNode) => number;
  isExpandable: (node: FlatNode) => boolean;
  getChildren: (
    node: TreeNode
  ) => Observable<Array<TreeNode>> | Array<TreeNode> | undefined | null;
  transformFunction: (node: TreeNode, depth: number) => FlatNode;
  initialData?: Array<TreeNode>;
};
