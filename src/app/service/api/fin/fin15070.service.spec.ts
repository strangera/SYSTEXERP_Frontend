import { TestBed } from '@angular/core/testing';

import { FIN15070Service } from './fin15070.service';

describe('FIN15070Service', () => {
  let service: FIN15070Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN15070Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
