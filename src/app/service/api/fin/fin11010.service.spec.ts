import { TestBed } from '@angular/core/testing';

import { Fin11010Service } from './fin11010.service';

describe('Fin11010Service', () => {
  let service: Fin11010Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fin11010Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
