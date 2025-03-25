import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2J020Component } from './tls2j020.component';

describe('TLS2J020Component', () => {
  let component: TLS2J020Component;
  let fixture: ComponentFixture<TLS2J020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2J020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2J020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
