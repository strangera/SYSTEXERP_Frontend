import { TestBed } from '@angular/core/testing';

import { CounterCodeService } from './counter-code.service';

describe('CounterCodeService', () => {
  let service: CounterCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CounterCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
