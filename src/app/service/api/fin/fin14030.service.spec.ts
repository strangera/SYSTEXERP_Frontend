import { TestBed } from '@angular/core/testing';

import { Fin14030Service } from './fin14030.service';

describe('Fin14030Service', () => {
  let service: Fin14030Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fin14030Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
