import { TestBed } from '@angular/core/testing';

import { PaperTypeService } from './paper-type.service';

describe('PaperTypeService', () => {
  let service: PaperTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaperTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
