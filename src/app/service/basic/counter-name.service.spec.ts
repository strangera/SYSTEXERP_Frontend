import { TestBed } from '@angular/core/testing';

import { CounterNameService } from './counter-name.service';

describe('CounterNameService', () => {
  let service: CounterNameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CounterNameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
