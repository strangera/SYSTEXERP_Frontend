import { TestBed } from '@angular/core/testing';

import { Sysb600Service } from './sysb600.service';

describe('Sysb600Service', () => {
  let service: Sysb600Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sysb600Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
