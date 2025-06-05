import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23130Component } from './tls23130.component';

describe('TLS23130Component', () => {
  let component: TLS23130Component;
  let fixture: ComponentFixture<TLS23130Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23130Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23130Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
