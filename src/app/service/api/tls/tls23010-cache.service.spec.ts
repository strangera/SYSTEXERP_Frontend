import { TestBed } from '@angular/core/testing';

import { TLS23010CacheService } from './tls23010-cache.service';

describe('TLS23010CacheService', () => {
  let service: TLS23010CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS23010CacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
