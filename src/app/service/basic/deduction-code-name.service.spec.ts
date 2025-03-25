import { TestBed } from '@angular/core/testing';

import { DeductionCodeNameService } from './deduction-code-name.service';

describe('DeductionCodeNameService', () => {
  let service: DeductionCodeNameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeductionCodeNameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
