import { TestBed } from '@angular/core/testing';

import { Fin52070Service } from './fin52070.service';

describe('Fin52070Service', () => {
  let service: Fin52070Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fin52070Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
