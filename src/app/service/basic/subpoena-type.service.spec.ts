import { TestBed } from '@angular/core/testing';

import { SubpoenaTypeService } from './subpoena-type.service';

describe('SubpoenaTypeService', () => {
  let service: SubpoenaTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubpoenaTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
