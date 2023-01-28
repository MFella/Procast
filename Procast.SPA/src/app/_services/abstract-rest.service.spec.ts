import { TestBed } from '@angular/core/testing';

import { AbstractRestService } from './abstract-rest.service';

describe('AbstractRestService', () => {
  let service: AbstractRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AbstractRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
