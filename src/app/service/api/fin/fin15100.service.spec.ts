import { TestBed } from '@angular/core/testing';

import { FIN15100Service } from './fin15100.service';

describe('FIN15100Service', () => {
  let service: FIN15100Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN15100Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
