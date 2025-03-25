import { TestBed } from '@angular/core/testing';

import { PostOptionService } from './post-option.service';

describe('PostOptionService', () => {
  let service: PostOptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostOptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
