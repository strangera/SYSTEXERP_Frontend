import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS31020Component } from './tls31020.component';

describe('TLS31020Component', () => {
  let component: TLS31020Component;
  let fixture: ComponentFixture<TLS31020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS31020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS31020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
