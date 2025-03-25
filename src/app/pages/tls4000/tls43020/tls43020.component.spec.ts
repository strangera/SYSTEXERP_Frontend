import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS43020Component } from './tls43020.component';

describe('TLS43020Component', () => {
  let component: TLS43020Component;
  let fixture: ComponentFixture<TLS43020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS43020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS43020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
