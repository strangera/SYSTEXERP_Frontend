import { TestBed } from '@angular/core/testing';

import { Fin11090Service } from './fin11090.service';

describe('Fin11090Service', () => {
  let service: Fin11090Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fin11090Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
