import { TestBed } from '@angular/core/testing';

import { ExportMethodService } from './export-method.service';

describe('ExportMethodService', () => {
  let service: ExportMethodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportMethodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
