import { TestBed } from '@angular/core/testing';

import { Sys0230Service } from './sys0230.service';

describe('Sys0230Service', () => {
  let service: Sys0230Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sys0230Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
