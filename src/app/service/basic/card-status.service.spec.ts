import { TestBed } from '@angular/core/testing';

import { CardStatusService } from './card-status.service';

describe('CardStatusService', () => {
  let service: CardStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
