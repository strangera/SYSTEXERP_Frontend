import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS11020Component } from './tls11020.component';

describe('TLS11020Component', () => {
  let component: TLS11020Component;
  let fixture: ComponentFixture<TLS11020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS11020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS11020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
