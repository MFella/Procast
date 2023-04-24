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
import { SidebarManagerService } from '../_services/sidebar/sidebar-manager.service';

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

  constructor(private readonly sidebarManagerService: SidebarManagerService) {}

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
      const sectionId: string = self.crypto.randomUUID();
      const section = {
        title,
        withChevron: true,
        options: this.getSectionOptions(4),
        id: sectionId,
        onClick: () => console.log('Section title clicked'),
      };
      this.sidebarManagerService.saveSectionIdToOptions(
        sectionId,
        section.options.map((option) => option.id)
      );
      sidebarSections.push(section);
    }

    return sidebarSections;
  }

  private getSectionOptions(optionCount: number): Array<SidebarSectionOption> {
    const sectionOptions: Array<SidebarSectionOption> = [];

    for (const i in [...Array(optionCount).keys()]) {
      const sectionId: string = self.crypto.randomUUID();
      sectionOptions.push({
        title: (`OPTION_TITLE_` + i) as Uppercase<string>,
        iconClass: 'visibility',
        iconPosition: 'left',
        onClick: (wtf) => {
          this.sidebarManagerService.emitOptionClicked(sectionId);
          console.log(wtf);
        },
        id: sectionId,
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
