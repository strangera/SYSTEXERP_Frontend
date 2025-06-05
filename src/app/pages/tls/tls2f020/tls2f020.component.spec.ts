import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2F020Component } from './tls2f020.component';

describe('TLS2F020Component', () => {
  let component: TLS2F020Component;
  let fixture: ComponentFixture<TLS2F020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2F020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2F020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
