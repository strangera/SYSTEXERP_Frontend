import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23040Component } from './tls23040.component';

describe('TLS23040Component', () => {
  let component: TLS23040Component;
  let fixture: ComponentFixture<TLS23040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
