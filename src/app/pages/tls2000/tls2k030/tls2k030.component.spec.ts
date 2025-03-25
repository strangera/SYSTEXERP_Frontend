import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2K030Component } from './tls2k030.component';

describe('TLS2K030Component', () => {
  let component: TLS2K030Component;
  let fixture: ComponentFixture<TLS2K030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2K030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2K030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
