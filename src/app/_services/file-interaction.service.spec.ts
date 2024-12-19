import { TestBed } from '@angular/core/testing';

import { FileInteractionService } from './file-interaction.service';

describe('FileReaderService', () => {
  let service: FileInteractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileInteractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
