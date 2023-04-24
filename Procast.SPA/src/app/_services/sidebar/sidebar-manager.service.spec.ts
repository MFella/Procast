import { TestBed } from '@angular/core/testing';

import { SidebarManagerService } from './sidebar-manager.service';

describe('SidebarManagerService', () => {
  let service: SidebarManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SidebarManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
