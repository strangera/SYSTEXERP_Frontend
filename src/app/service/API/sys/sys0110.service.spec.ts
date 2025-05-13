import { TestBed } from '@angular/core/testing';

import { Sys0110Service } from './sys0110.service';

describe('Sys0110Service', () => {
  let service: Sys0110Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sys0110Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
