import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2F030Component } from './tls2f030.component';

describe('TLS2F030Component', () => {
  let component: TLS2F030Component;
  let fixture: ComponentFixture<TLS2F030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2F030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2F030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
