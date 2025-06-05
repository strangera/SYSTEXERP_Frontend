import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23120Component } from './tls23120.component';

describe('TLS23120Component', () => {
  let component: TLS23120Component;
  let fixture: ComponentFixture<TLS23120Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23120Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23120Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
