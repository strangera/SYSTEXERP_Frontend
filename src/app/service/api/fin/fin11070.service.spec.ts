import { TestBed } from '@angular/core/testing';

import { FIN11070Service } from './fin11070.service';

describe('FIN11070Service', () => {
  let service: FIN11070Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN11070Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
