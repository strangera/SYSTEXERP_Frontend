import { TestBed } from '@angular/core/testing';

import { Fin52050Service } from './fin52050.service';

describe('Fin52050Service', () => {
  let service: Fin52050Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fin52050Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
