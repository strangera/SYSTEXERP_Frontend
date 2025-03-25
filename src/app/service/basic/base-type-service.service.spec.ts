import { TestBed } from '@angular/core/testing';

import { BaseTypeServiceService } from './base-type-service.service';

describe('BaseTypeServiceService', () => {
  let service: BaseTypeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BaseTypeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
