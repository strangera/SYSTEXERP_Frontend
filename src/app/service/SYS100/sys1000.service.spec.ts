import { TestBed } from '@angular/core/testing';

import { Sys1000Service } from './sys1000.service';

describe('Sys1000Service', () => {
  let service: Sys1000Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sys1000Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
