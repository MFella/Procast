import { TestBed } from '@angular/core/testing';

import { MyDataSidebarDataResolver } from './my-data-sidebar-data.resolver';

describe('MyDataResolver', () => {
  let resolver: MyDataSidebarDataResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(MyDataSidebarDataResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
