import { TestBed } from '@angular/core/testing';

import { MessageTypeService } from './message-type.service';

describe('MessageTypeService', () => {
  let service: MessageTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
