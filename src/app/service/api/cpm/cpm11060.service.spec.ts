import { TestBed } from '@angular/core/testing';

import { CPM11060Service } from './cpm11060.service';

describe('CPM11060Service', () => {
  let service: CPM11060Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CPM11060Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
