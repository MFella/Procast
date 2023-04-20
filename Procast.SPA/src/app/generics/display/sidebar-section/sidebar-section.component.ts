import { Position } from './../sidebar/types/position';
import { SidebarSection } from './../sidebar/types/sidebarConfig';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';

import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource } from '@angular/material/tree';
import { FlatNode } from '../sidebar/types/tree/flatNode';
import { MatTreeManager } from 'src/app/utils/structural/tree/matTreeManager';
import { MatTreeFlatConfig } from 'src/app/utils/structural/tree/matTreeFlatConfig';
import { TreeNode } from '../sidebar/types/tree/treeNode';

@Component({
  selector: 'pc-sidebar-section',
  templateUrl: './sidebar-section.component.html',
  styleUrls: ['./sidebar-section.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarSectionComponent implements OnInit {
  @Input()
  section!: SidebarSection;

  @Input()
  position!: Position;

  panelOpenState: boolean = false;

  treeFlatConfig!: MatTreeFlatConfig;

  dataSource!: MatTreeFlatDataSource<TreeNode, FlatNode>;
  treeControl!: FlatTreeControl<FlatNode, FlatNode>;

  constructor(
    private readonly matTreeManager: MatTreeManager,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setTreeData();
  }

  private async setTreeData(): Promise<void> {
    const singleTreeNode: TreeNode =
      await this.matTreeManager.buildSingleTreeNodeFromSidebarSection(
        this.section
      );

    const { dataSource, treeControl } = MatTreeManager.getMatTreeSetupData(
      this.getMatTreeFlatConfig([singleTreeNode])
    );

    this.dataSource = dataSource;
    this.treeControl = treeControl;
    console.log(this.section);
    this.changeDetectorRef.detectChanges();
  }

  private getClasses(): Array<string> {
    switch (this.position) {
      case 'left':
      case 'right':
        return ['flex', 'text-left'];
      case 'top':
      case 'bottom':
        return ['inline-flex', 'text-left'];
      default:
        return [];
    }
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  private getMatTreeFlatConfig(
    singleTreeNode: Array<TreeNode> = []
  ): MatTreeFlatConfig {
    return {
      getDepth: (node: FlatNode) => node.depth,
      isExpandable: (node: FlatNode) => node.expandable,
      getChildren: (node: TreeNode) => node.children,
      transformFunction: this.getTransformerFn.bind(this),
      initialData: singleTreeNode,
    };
  }

  private getTransformerFn(treeNode: TreeNode, depth: number): FlatNode {
    return {
      expandable: !!treeNode.children && treeNode.children.length > 0,
      name: treeNode.name,
      depth,
      withChevron: treeNode.withChevron,
      iconClass: treeNode.iconClass,
      iconPosition: treeNode.iconPosition,
      onClick: treeNode.onClick,
    };
  }
}
