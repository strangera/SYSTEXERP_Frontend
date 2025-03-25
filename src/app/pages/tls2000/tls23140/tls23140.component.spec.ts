import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23140Component } from './tls23140.component';

describe('TLS23140Component', () => {
  let component: TLS23140Component;
  let fixture: ComponentFixture<TLS23140Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23140Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23140Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
