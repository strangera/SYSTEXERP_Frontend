import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS21030Component } from './tls21030.component';

describe('TLS21030Component', () => {
  let component: TLS21030Component;
  let fixture: ComponentFixture<TLS21030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS21030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS21030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
