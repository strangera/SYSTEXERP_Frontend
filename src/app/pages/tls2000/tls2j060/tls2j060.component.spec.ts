import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2J060Component } from './tls2j060.component';

describe('TLS2J060Component', () => {
  let component: TLS2J060Component;
  let fixture: ComponentFixture<TLS2J060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2J060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2J060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
