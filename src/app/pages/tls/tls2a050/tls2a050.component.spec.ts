import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2A050Component } from './tls2a050.component';

describe('TLS2A050Component', () => {
  let component: TLS2A050Component;
  let fixture: ComponentFixture<TLS2A050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2A050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2A050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
