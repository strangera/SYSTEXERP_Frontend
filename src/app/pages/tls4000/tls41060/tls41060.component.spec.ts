import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS41060Component } from './tls41060.component';

describe('TLS41060Component', () => {
  let component: TLS41060Component;
  let fixture: ComponentFixture<TLS41060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS41060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS41060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
