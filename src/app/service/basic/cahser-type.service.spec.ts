import { TestBed } from '@angular/core/testing';

import { CahserTypeService } from './cahser-type.service';

describe('CahserTypeService', () => {
  let service: CahserTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CahserTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
