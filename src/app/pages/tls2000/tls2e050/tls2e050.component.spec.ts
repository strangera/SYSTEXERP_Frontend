import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E050Component } from './tls2e050.component';

describe('TLS2E050Component', () => {
  let component: TLS2E050Component;
  let fixture: ComponentFixture<TLS2E050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
