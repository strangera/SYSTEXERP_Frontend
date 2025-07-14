import { TestBed } from '@angular/core/testing';

import { SYSBR10Service } from './sysbr10.service';

describe('SYSBR10Service', () => {
  let service: SYSBR10Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SYSBR10Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
