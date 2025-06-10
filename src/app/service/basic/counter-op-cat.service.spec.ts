import { TestBed } from '@angular/core/testing';

import { CounterOpCatService } from './counter-op-cat.service';

describe('CounterOpCatService', () => {
  let service: CounterOpCatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CounterOpCatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
