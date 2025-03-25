import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS31080Component } from './tls31080.component';

describe('TLS31080Component', () => {
  let component: TLS31080Component;
  let fixture: ComponentFixture<TLS31080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS31080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS31080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
