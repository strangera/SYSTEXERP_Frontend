import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E020Component } from './tls2e020.component';

describe('TLS2E020Component', () => {
  let component: TLS2E020Component;
  let fixture: ComponentFixture<TLS2E020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
