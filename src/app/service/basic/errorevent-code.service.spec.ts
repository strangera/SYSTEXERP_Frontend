import { TestBed } from '@angular/core/testing';

import { ErroreventCodeService } from './errorevent-code.service';

describe('ErroreventCodeService', () => {
  let service: ErroreventCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErroreventCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
