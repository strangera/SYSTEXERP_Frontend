import { TestBed } from '@angular/core/testing';

import { Fin14040Service } from './fin14040.service';

describe('Fin14040Service', () => {
  let service: Fin14040Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fin14040Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
