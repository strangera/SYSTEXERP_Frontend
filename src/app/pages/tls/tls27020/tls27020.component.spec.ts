import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS27020Component } from './tls27020.component';

describe('TLS27020Component', () => {
  let component: TLS27020Component;
  let fixture: ComponentFixture<TLS27020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS27020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS27020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
