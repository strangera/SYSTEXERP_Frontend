import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23050Component } from './tls23050.component';

describe('TLS23050Component', () => {
  let component: TLS23050Component;
  let fixture: ComponentFixture<TLS23050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
