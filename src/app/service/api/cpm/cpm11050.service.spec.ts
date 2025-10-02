import { TestBed } from '@angular/core/testing';

import { CPM11050Service } from './cpm11050.service';

describe('CPM11050Service', () => {
  let service: CPM11050Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CPM11050Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
