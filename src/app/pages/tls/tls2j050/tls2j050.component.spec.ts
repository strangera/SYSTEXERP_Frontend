import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2J050Component } from './tls2j050.component';

describe('TLS2J050Component', () => {
  let component: TLS2J050Component;
  let fixture: ComponentFixture<TLS2J050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2J050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2J050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
