import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E090Component } from './tls2e090.component';

describe('TLS2E090Component', () => {
  let component: TLS2E090Component;
  let fixture: ComponentFixture<TLS2E090Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E090Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E090Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
