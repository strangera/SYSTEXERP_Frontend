import { TestBed } from '@angular/core/testing';

import { Sysb500Service } from './sysb500.service';

describe('Sysb500Service', () => {
  let service: Sysb500Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sysb500Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
