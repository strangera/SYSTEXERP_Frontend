import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS31010Component } from './tls31010.component';

describe('TLS31010Component', () => {
  let component: TLS31010Component;
  let fixture: ComponentFixture<TLS31010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS31010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS31010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
