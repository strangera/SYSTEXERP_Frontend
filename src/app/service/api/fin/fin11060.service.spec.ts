import { TestBed } from '@angular/core/testing';

import { Fin11060Service } from './fin11060.service';

describe('Fin11060Service', () => {
  let service: Fin11060Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fin11060Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
