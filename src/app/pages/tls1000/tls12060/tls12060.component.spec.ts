import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS12060Component } from './tls12060.component';

describe('TLS12060Component', () => {
  let component: TLS12060Component;
  let fixture: ComponentFixture<TLS12060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS12060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS12060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
