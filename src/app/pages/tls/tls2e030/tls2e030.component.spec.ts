import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E030Component } from './tls2e030.component';

describe('TLS2E030Component', () => {
  let component: TLS2E030Component;
  let fixture: ComponentFixture<TLS2E030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
