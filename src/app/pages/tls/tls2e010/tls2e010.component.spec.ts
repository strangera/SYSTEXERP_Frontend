import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E010Component } from './tls2e010.component';

describe('TLS2E010Component', () => {
  let component: TLS2E010Component;
  let fixture: ComponentFixture<TLS2E010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
