import { TestBed } from '@angular/core/testing';

import { Sysb400Service } from './sysb400.service';

describe('Sysb400Service', () => {
  let service: Sysb400Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sysb400Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
