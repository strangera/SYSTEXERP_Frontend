import { TestBed } from '@angular/core/testing';

import { AnnouncementCategoryService } from './announcement-category.service';

describe('AnnouncementCategoryService', () => {
  let service: AnnouncementCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnouncementCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
