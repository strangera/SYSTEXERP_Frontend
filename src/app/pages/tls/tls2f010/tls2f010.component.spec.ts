import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2F010Component } from './tls2f010.component';

describe('TLS2F010Component', () => {
  let component: TLS2F010Component;
  let fixture: ComponentFixture<TLS2F010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2F010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2F010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
