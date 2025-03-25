import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS52020Component } from './tls52020.component';

describe('TLS52020Component', () => {
  let component: TLS52020Component;
  let fixture: ComponentFixture<TLS52020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS52020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS52020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
