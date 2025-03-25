import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2J040Component } from './tls2j040.component';

describe('TLS2J040Component', () => {
  let component: TLS2J040Component;
  let fixture: ComponentFixture<TLS2J040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2J040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2J040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
