import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS45010Component } from './tls45010.component';

describe('TLS45010Component', () => {
  let component: TLS45010Component;
  let fixture: ComponentFixture<TLS45010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS45010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS45010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
