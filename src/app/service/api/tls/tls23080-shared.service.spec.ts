import { TestBed } from '@angular/core/testing';

import { TLS23080SharedService } from '../../../pages/tls/tls23080-cru/tls23080-shared.service';

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
