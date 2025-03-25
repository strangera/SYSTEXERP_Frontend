import { TestBed } from '@angular/core/testing';

import { DataTypeService } from './data-type.service';

describe('DataTypeService', () => {
  let service: DataTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
