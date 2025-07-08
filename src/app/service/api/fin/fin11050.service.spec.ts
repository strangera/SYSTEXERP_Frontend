import { TestBed } from '@angular/core/testing';

import { Fin11050Service } from './fin11050.service';

describe('Fin11050Service', () => {
  let service: Fin11050Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fin11050Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
