import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2J070Component } from './tls2j070.component';

describe('TLS2J070Component', () => {
  let component: TLS2J070Component;
  let fixture: ComponentFixture<TLS2J070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2J070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2J070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
