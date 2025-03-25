import { TestBed } from '@angular/core/testing';

import { EventCodeService } from './event-code.service';

describe('EventCodeService', () => {
  let service: EventCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
