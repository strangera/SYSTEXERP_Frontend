import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS31060Component } from './tls31060.component';

describe('TLS31060Component', () => {
  let component: TLS31060Component;
  let fixture: ComponentFixture<TLS31060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS31060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS31060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
