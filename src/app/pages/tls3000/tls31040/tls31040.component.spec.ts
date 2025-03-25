import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS31040Component } from './tls31040.component';

describe('TLS31040Component', () => {
  let component: TLS31040Component;
  let fixture: ComponentFixture<TLS31040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS31040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS31040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
