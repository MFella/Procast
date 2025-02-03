import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { cachedTrainConfigResolver } from './cached-train-config.resolver';

describe('cachedTrainConfigResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() =>
      cachedTrainConfigResolver(...resolverParameters)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
