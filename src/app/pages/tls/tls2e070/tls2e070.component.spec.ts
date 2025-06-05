import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E070Component } from './tls2e070.component';

describe('TLS2E070Component', () => {
  let component: TLS2E070Component;
  let fixture: ComponentFixture<TLS2E070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
