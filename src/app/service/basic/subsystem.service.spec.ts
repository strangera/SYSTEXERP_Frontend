import { TestBed } from '@angular/core/testing';

import { SubsystemService } from './subsystem.service';

describe('SubsystemService', () => {
  let service: SubsystemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubsystemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
