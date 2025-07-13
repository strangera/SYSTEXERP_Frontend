import { TestBed } from '@angular/core/testing';

import { SYSBR00Service } from './sysbr00.service';

describe('SYSBR00Service', () => {
  let service: SYSBR00Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SYSBR00Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
