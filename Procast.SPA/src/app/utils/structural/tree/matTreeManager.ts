import { SidebarSection } from './../../../generics/display/sidebar/types/sidebarConfig';
import { FlatNode } from './../../../generics/display/sidebar/types/tree/flatNode';
import { FlatTreeControl, FlatTreeControlOptions } from '@angular/cdk/tree';
import { Injectable } from '@angular/core';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import { MatTreeFlatConfig } from './matTreeFlatConfig';
import { Observable, firstValueFrom } from 'rxjs';
import { TreeNode } from 'src/app/generics/display/sidebar/types/tree/treeNode';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class MatTreeManager {
  constructor(private readonly translateService: TranslateService) {}
  static getMatTreeSetupData(config: MatTreeFlatConfig): {
    dataSource: MatTreeFlatDataSource<TreeNode, FlatNode>;
    treeControl: FlatTreeControl<FlatNode>;
  } {
    const treeControl = MatTreeManager.getFlatTreeControl(
      config.getDepth,
      config.isExpandable
    );
    const treeFlattener = MatTreeManager.getTreeFlattener(
      config.transformFunction,
      config.getDepth,
      config.isExpandable,
      config.getChildren
    );

    return {
      dataSource: new MatTreeFlatDataSource<TreeNode, FlatNode>(
        treeControl,
        treeFlattener,
        config.initialData
      ),
      treeControl,
    };
  }

  async buildSingleTreeNodeFromSidebarSection(
    section: SidebarSection
  ): Promise<TreeNode> {
    const parentTreeNode: TreeNode = {
      name: await firstValueFrom(this.translateService.get(section.title)),
      onClick: section.onClick,
      children: [],
    };

    parentTreeNode.children = (await Promise.all(
      section.options.map(async (option) => {
        return {
          name: await firstValueFrom(this.translateService.get(option.title)),
          withChevron: false,
          children: [],
          iconClass: option.iconClass,
          iconPosition: option.iconPosition,
          onClick: option.onClick,
        };
      })
    )) as Array<TreeNode>;

    parentTreeNode.withChevron = parentTreeNode.children.length > 0;

    return parentTreeNode;
  }

  private static getFlatTreeControl(
    getLevel: (dataNode: FlatNode) => number,
    isExpandable: (dataNode: FlatNode) => boolean,
    options?: FlatTreeControlOptions<FlatNode, FlatNode> | undefined
  ): FlatTreeControl<FlatNode> {
    return new FlatTreeControl(getLevel, isExpandable, options);
  }

  private static getTreeFlattener(
    transformFunction: (node: TreeNode, depth: number) => FlatNode,
    getLevel: (node: FlatNode) => number,
    isExpandable: (node: FlatNode) => boolean,
    getChildren: (
      node: TreeNode
    ) => Observable<Array<TreeNode>> | Array<TreeNode> | undefined | null
  ): MatTreeFlattener<TreeNode, FlatNode> {
    return new MatTreeFlattener<TreeNode, FlatNode>(
      transformFunction,
      getLevel,
      isExpandable,
      getChildren
    );
  }
}
