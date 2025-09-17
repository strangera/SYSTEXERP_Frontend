import { TestBed } from '@angular/core/testing';

import { Fin52060Service } from './fin52060.service';

describe('Fin52060Service', () => {
  let service: Fin52060Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fin52060Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
