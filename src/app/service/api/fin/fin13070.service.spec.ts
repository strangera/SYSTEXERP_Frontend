import { TestBed } from '@angular/core/testing';

import { FIN13070Service } from './fin13070.service';

describe('FIN13070Service', () => {
  let service: FIN13070Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN13070Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
