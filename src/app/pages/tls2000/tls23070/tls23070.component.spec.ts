import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23070Component } from './tls23070.component';

describe('TLS23070Component', () => {
  let component: TLS23070Component;
  let fixture: ComponentFixture<TLS23070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
