import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E100Component } from './tls2e100.component';

describe('TLS2E100Component', () => {
  let component: TLS2E100Component;
  let fixture: ComponentFixture<TLS2E100Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E100Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
