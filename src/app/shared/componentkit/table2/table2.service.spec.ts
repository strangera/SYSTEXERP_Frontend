import { TestBed } from '@angular/core/testing';

import { Table2Service } from './table2.service';

describe('TableService', () => {
  let service: Table2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Table2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
