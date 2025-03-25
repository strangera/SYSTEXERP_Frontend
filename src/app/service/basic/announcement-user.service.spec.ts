import { TestBed } from '@angular/core/testing';

import { AnnouncementUserService } from './announcement-user.service';

describe('AnnouncementUserService', () => {
  let service: AnnouncementUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnouncementUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
