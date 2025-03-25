import { TestBed } from '@angular/core/testing';

import { TicketCategoryService } from './ticket-category.service';

describe('TicketCategoryService', () => {
  let service: TicketCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
