import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS32050Component } from './tls32050.component';

describe('TLS32050Component', () => {
  let component: TLS32050Component;
  let fixture: ComponentFixture<TLS32050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS32050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS32050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
