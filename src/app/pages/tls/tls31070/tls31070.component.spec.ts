import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS31070Component } from './tls31070.component';

describe('TLS31070Component', () => {
  let component: TLS31070Component;
  let fixture: ComponentFixture<TLS31070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS31070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS31070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
