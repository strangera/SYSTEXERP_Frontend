import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS31090Component } from './tls31090.component';

describe('TLS31090Component', () => {
  let component: TLS31090Component;
  let fixture: ComponentFixture<TLS31090Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS31090Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS31090Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
