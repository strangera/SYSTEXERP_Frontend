import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS31050Component } from './tls31050.component';

describe('TLS31050Component', () => {
  let component: TLS31050Component;
  let fixture: ComponentFixture<TLS31050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS31050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS31050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
