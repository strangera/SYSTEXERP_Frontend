import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS21040Component } from './tls21040.component';

describe('TLS21040Component', () => {
  let component: TLS21040Component;
  let fixture: ComponentFixture<TLS21040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS21040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS21040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
