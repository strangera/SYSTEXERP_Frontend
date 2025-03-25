import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23030Component } from './tls23030.component';

describe('TLS23030Component', () => {
  let component: TLS23030Component;
  let fixture: ComponentFixture<TLS23030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
