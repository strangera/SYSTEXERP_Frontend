import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2G020Component } from './tls2g020.component';

describe('TLS2G020Component', () => {
  let component: TLS2G020Component;
  let fixture: ComponentFixture<TLS2G020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2G020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2G020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
