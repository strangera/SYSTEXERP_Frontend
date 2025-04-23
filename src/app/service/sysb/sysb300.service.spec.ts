import { TestBed } from '@angular/core/testing';

import { Sysb300Service } from './sysb300.service';

describe('Sysb300Service', () => {
  let service: Sysb300Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sysb300Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
