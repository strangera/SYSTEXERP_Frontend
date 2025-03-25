import { TestBed } from '@angular/core/testing';

import { ContenttypeinterceptorService } from './contenttypeinterceptor.service';

describe('ContenttypeinterceptorService', () => {
  let service: ContenttypeinterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContenttypeinterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
