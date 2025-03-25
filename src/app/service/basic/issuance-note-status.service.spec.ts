import { TestBed } from '@angular/core/testing';

import { IssuanceNoteStatusService } from './issuance-note-status.service';

describe('IssuanceNoteStatusService', () => {
  let service: IssuanceNoteStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IssuanceNoteStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
