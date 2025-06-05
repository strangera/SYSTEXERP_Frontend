import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2A010Component } from './tls2a010.component';

describe('TLS2A010Component', () => {
  let component: TLS2A010Component;
  let fixture: ComponentFixture<TLS2A010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2A010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2A010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
