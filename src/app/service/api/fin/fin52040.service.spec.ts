import { TestBed } from '@angular/core/testing';

import { Fin52040Service } from './fin52040.service';

describe('Fin52040Service', () => {
  let service: Fin52040Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fin52040Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
