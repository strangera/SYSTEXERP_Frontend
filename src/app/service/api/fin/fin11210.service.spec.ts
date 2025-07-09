import { TestBed } from '@angular/core/testing';

import { Fin11210Service } from './fin11210.service';

describe('Fin11210Service', () => {
  let service: Fin11210Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fin11210Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
