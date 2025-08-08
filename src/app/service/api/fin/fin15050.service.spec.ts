import { TestBed } from '@angular/core/testing';

import { FIN15050Service } from './fin15050.service';

describe('FIN15050Service', () => {
  let service: FIN15050Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN15050Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
