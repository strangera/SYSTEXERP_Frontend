import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS21010Component } from './tls21010.component';

describe('TLS21010Component', () => {
  let component: TLS21010Component;
  let fixture: ComponentFixture<TLS21010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS21010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS21010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
