import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS12070Component } from './tls12070.component';

describe('TLS12070Component', () => {
  let component: TLS12070Component;
  let fixture: ComponentFixture<TLS12070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS12070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS12070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
