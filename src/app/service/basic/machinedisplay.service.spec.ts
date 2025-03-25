import { TestBed } from '@angular/core/testing';

import { MachinedisplayService } from './machinedisplay.service';

describe('MachinedisplayService', () => {
  let service: MachinedisplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MachinedisplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
