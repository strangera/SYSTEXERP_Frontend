import { TestBed } from '@angular/core/testing';

import { IndustryTypeService } from './industry-type.service';

describe('IndustryTypeService', () => {
  let service: IndustryTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndustryTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
