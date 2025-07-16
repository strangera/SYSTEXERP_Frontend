import { TestBed } from '@angular/core/testing';

import { BaseTypeService } from './base-type-service.service';

describe('BaseTypeService', () => {
  let service: BaseTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BaseTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
