import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS52010Component } from './tls52010.component';

describe('TLS52010Component', () => {
  let component: TLS52010Component;
  let fixture: ComponentFixture<TLS52010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS52010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS52010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
