import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS57100Component } from './tls57100.component';

describe('TLS57100Component', () => {
  let component: TLS57100Component;
  let fixture: ComponentFixture<TLS57100Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS57100Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS57100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
