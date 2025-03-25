import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23080Component } from './tls23080.component';

describe('TLS23080Component', () => {
  let component: TLS23080Component;
  let fixture: ComponentFixture<TLS23080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
