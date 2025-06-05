import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS21020Component } from './tls21020.component';

describe('TLS21020Component', () => {
  let component: TLS21020Component;
  let fixture: ComponentFixture<TLS21020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS21020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS21020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
