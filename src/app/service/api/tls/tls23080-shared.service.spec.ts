import { TestBed } from '@angular/core/testing';

import { TLS23080SharedService } from './tls23080-shared.service';

describe('TLS23080SharedService', () => {
  let service: TLS23080SharedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS23080SharedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
