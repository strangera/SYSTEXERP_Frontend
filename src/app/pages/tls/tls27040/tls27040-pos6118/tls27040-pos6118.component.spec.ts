import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls27040POS6118Component } from './tls27040-pos6118.component';

describe('Tls27040POS6118Component', () => {
  let component: Tls27040POS6118Component;
  let fixture: ComponentFixture<Tls27040POS6118Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls27040POS6118Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls27040POS6118Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
