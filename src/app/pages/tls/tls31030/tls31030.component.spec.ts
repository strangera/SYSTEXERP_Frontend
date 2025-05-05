import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS31030Component } from './tls31030.component';

describe('TLS31030Component', () => {
  let component: TLS31030Component;
  let fixture: ComponentFixture<TLS31030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS31030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS31030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
