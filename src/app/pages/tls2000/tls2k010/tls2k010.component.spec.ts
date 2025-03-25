import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2K010Component } from './tls2k010.component';

describe('TLS2K010Component', () => {
  let component: TLS2K010Component;
  let fixture: ComponentFixture<TLS2K010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2K010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2K010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
