import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2G030Component } from './tls2g030.component';

describe('TLS2G030Component', () => {
  let component: TLS2G030Component;
  let fixture: ComponentFixture<TLS2G030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2G030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2G030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
