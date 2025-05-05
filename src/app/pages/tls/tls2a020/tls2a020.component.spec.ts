import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2A020Component } from './tls2a020.component';

describe('TLS2A020Component', () => {
  let component: TLS2A020Component;
  let fixture: ComponentFixture<TLS2A020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2A020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2A020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
