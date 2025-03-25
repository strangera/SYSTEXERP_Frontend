import { TestBed } from '@angular/core/testing';

import { JournalTypeService } from './journal-type.service';

describe('JournalTypeService', () => {
  let service: JournalTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JournalTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
