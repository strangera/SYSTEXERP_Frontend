import { TestBed } from '@angular/core/testing';

import { Tls26030Service } from './tls26030.service';

describe('Tls26030Service', () => {
  let service: Tls26030Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls26030Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
