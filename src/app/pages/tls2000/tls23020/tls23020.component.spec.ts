import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23020Component } from './tls23020.component';

describe('TLS23020Component', () => {
  let component: TLS23020Component;
  let fixture: ComponentFixture<TLS23020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
