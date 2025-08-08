import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls27040POS6119Component } from './tls27040-pos6119.component';

describe('Tls27040POS6119Component', () => {
  let component: Tls27040POS6119Component;
  let fixture: ComponentFixture<Tls27040POS6119Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls27040POS6119Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls27040POS6119Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
