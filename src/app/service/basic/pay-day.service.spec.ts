import { TestBed } from '@angular/core/testing';

import { PayDayService } from './pay-day.service';

describe('PayDayService', () => {
  let service: PayDayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayDayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
