import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2H030Component } from './tls2h030.component';

describe('TLS2H030Component', () => {
  let component: TLS2H030Component;
  let fixture: ComponentFixture<TLS2H030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2H030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2H030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
