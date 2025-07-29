import { TestBed } from '@angular/core/testing';

import { TableEditService } from './table-edit.service';

describe('TableEditService', () => {
  let service: TableEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
