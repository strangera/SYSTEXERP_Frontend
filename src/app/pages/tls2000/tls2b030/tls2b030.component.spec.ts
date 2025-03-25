import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2B030Component } from './tls2b030.component';

describe('TLS2B030Component', () => {
  let component: TLS2B030Component;
  let fixture: ComponentFixture<TLS2B030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2B030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2B030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
