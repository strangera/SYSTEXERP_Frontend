import { TestBed } from '@angular/core/testing';

import { Fin14020Service } from './fin14020.service';

describe('Fin14020Service', () => {
  let service: Fin14020Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fin14020Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
