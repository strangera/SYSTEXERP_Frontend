import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E040Component } from './tls2e040.component';

describe('TLS2E040Component', () => {
  let component: TLS2E040Component;
  let fixture: ComponentFixture<TLS2E040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
