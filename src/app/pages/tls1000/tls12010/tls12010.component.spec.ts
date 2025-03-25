import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS12010Component } from './tls12010.component';

describe('TLS12010Component', () => {
  let component: TLS12010Component;
  let fixture: ComponentFixture<TLS12010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS12010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS12010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
