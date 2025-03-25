import { TestBed } from '@angular/core/testing';

import { SubpoenaStatusService } from './subpoena-status.service';

describe('SubpoenaStatusService', () => {
  let service: SubpoenaStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubpoenaStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
