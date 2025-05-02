import { TestBed } from '@angular/core/testing';

import { Sysb100Service } from './sysb100.service';

describe('Sysb100Service', () => {
  let service: Sysb100Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sysb100Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
