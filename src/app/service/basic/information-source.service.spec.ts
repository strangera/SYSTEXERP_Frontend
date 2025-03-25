import { TestBed } from '@angular/core/testing';

import { InformationSourceService } from './information-source.service';

describe('InformationSourceService', () => {
  let service: InformationSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InformationSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
