import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23110Component } from './tls23110.component';

describe('TLS23110Component', () => {
  let component: TLS23110Component;
  let fixture: ComponentFixture<TLS23110Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23110Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23110Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
