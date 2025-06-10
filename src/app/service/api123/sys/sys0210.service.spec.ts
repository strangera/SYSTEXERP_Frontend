import { TestBed } from '@angular/core/testing';

import { Sys0210Service } from './sys0210.service';

describe('Sys0210Service', () => {
  let service: Sys0210Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sys0210Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
