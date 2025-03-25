import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2K050Component } from './tls2k050.component';

describe('TLS2K050Component', () => {
  let component: TLS2K050Component;
  let fixture: ComponentFixture<TLS2K050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2K050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2K050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
