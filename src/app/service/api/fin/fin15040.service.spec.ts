import { TestBed } from '@angular/core/testing';

import { FIN15040Service } from './fin15040.service';

describe('FIN15040Service', () => {
  let service: FIN15040Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN15040Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
