import { TestBed } from '@angular/core/testing';

import { Fin14010Service } from './fin14010.service';

describe('Fin14010Service', () => {
  let service: Fin14010Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fin14010Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
