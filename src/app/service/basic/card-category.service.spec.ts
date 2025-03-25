import { TestBed } from '@angular/core/testing';

import { CardCategoryService } from './card-category.service';

describe('CardCategoryService', () => {
  let service: CardCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
