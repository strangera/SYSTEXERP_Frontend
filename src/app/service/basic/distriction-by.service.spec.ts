import { TestBed } from '@angular/core/testing';

import { DistrictionByService } from './distriction-by.service';

describe('DistrictionByService', () => {
  let service: DistrictionByService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DistrictionByService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
