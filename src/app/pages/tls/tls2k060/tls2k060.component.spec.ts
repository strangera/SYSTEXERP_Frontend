import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2K060Component } from './tls2k060.component';

describe('TLS2K060Component', () => {
  let component: TLS2K060Component;
  let fixture: ComponentFixture<TLS2K060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2K060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2K060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
