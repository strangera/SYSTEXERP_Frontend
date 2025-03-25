import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23090Component } from './tls23090.component';

describe('TLS23090Component', () => {
  let component: TLS23090Component;
  let fixture: ComponentFixture<TLS23090Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23090Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23090Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
