import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23060Component } from './tls23060.component';

describe('TLS23060Component', () => {
  let component: TLS23060Component;
  let fixture: ComponentFixture<TLS23060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
