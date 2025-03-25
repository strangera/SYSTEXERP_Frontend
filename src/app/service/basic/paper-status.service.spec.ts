import { TestBed } from '@angular/core/testing';

import { PaperStatusService } from './paper-status.service';

describe('PaperStatusService', () => {
  let service: PaperStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaperStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
