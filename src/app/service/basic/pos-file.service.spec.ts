import { TestBed } from '@angular/core/testing';

import { PosFileService } from './pos-file.service';

describe('PosFileService', () => {
  let service: PosFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PosFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
