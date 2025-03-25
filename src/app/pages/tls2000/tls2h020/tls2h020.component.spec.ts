import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2H020Component } from './tls2h020.component';

describe('TLS2H020Component', () => {
  let component: TLS2H020Component;
  let fixture: ComponentFixture<TLS2H020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2H020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2H020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
