import {
  SidebarSection,
  SidebarSectionOption,
} from './../generics/display/sidebar/types/sidebarConfig';
import { Injectable } from '@angular/core';
import {
  Router,
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { SidebarDataResolver } from '../generics/display/sidebar/resolvers/sidebarDataResolver';
import { SidebarConfig } from '../generics/display/sidebar/types/sidebarConfig';

@Injectable({
  providedIn: 'root',
})
export class MyDataSidebarDataResolver
  implements Resolve<SidebarConfig>, SidebarDataResolver
{
  private readonly sectionTitles: Array<Uppercase<string>> = [
    'PC_MY_DATA_SIDEBAR_SECTION_DATA_SETS_TITLE',
    'PC_MY_DATA_SIDEBAR_SECTION_GROUPS_TITLE',
    'PC_MY_DATA_SIDEBAR_SECTION_DATA_TITLE',
  ];

  constructor() {}

  resolve(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<SidebarConfig> {
    return of(this.resolveSidebarData());
  }

  resolveSidebarData(): SidebarConfig {
    return {
      sections: this.getMockedSidebarSections(),
      position: 'left',
    };
  }

  private getMockedSidebarSections(): Array<SidebarSection> {
    const sidebarSections: Array<SidebarSection> = [];

    for (const title of this.sectionTitles) {
      const section = {
        title,
        withChevron: true,
        options: this.getSectionOptions(4),
        onClick: () => console.log('Section title clicked'),
      };
      sidebarSections.push(section);
    }

    return sidebarSections;
  }

  private getSectionOptions(optionCount: number): Array<SidebarSectionOption> {
    const sectionOptions: Array<SidebarSectionOption> = [];

    for (const i in [...Array(optionCount).keys()]) {
      sectionOptions.push({
        title: (`OPTION_TITLE_` + i) as Uppercase<string>,
        iconClass: 'visibility',
        iconPosition: 'left',
        onClick: () => console.log('Option section clicked'),
      });
    }

    return sectionOptions;
  }

  // private getSectionOptionItemsConfig(): Map<string, SidebarSectionOption> {
  //   const sectionIdToOptionItemsConfigMap: Map<string, SidebarSectionOption> =
  //     new Map<string, SidebarSectionOption>();

  //   // retrieve data from backend via
  // }

  // private getSectionTitleItemsConfig(): Map<string, SidebarSection> {
  //   const sectionIdToTitleItemsConfigMap: Map<string, SidebarSection> = new Map<
  //     string,
  //     SidebarSection
  //   >();

  //   const sectionTitles: Array<Uppercase<string>> = [
  //     'PC_MY_DATA_SIDEBAR_SECTION_DATA_SETS_TITLE',
  //     'PC_MY_DATA_SIDEBAR_SECTION_GROUPS_TITLE',
  //     'PC_MY_DATA_SIDEBAR_SECTION_DATA_TITLE',
  //   ];

  //   for (const sectionId of sectionTitles) {
  //     sectionIdToTitleItemsConfigMap.set(sectionId, {
  //       title: sectionId,
  //       withChevron: true,
  //       onClick: () => {},
  //     });
  //   }

  //   return sectionIdToTitleItemsConfigMap;
  // }
}
