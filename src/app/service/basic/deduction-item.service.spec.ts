import { TestBed } from '@angular/core/testing';

import { DeductionItemService } from './deduction-item.service';

describe('DeductionItemService', () => {
  let service: DeductionItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeductionItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
