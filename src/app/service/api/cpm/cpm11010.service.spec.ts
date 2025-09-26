import { TestBed } from '@angular/core/testing';

import { CPM11010Service } from './cpm11010.service';

describe('CPM11010Service', () => {
  let service: CPM11010Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CPM11010Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
