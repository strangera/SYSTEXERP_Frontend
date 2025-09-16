import { TestBed } from '@angular/core/testing';

import { FIN11080Service } from './fin11080.service';

describe('FIN11080Service', () => {
  let service: FIN11080Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN11080Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
