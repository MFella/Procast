import { Injectable } from '@angular/core';
import { SidebarConfig } from '../generics/display/sidebar/types/sidebarConfig';
import { Storage } from '../utils/common/storage';

@Injectable()
export class MyDataSidebarConfigRepository extends Storage<SidebarConfig> {}
