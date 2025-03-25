import { TestBed } from '@angular/core/testing';

import { ReimbursementYypeService } from './reimbursement-yype.service';

describe('ReimbursementYypeService', () => {
  let service: ReimbursementYypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReimbursementYypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
