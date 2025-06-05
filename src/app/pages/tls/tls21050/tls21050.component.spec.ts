import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS21050Component } from './tls21050.component';

describe('TLS21050Component', () => {
  let component: TLS21050Component;
  let fixture: ComponentFixture<TLS21050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS21050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS21050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
