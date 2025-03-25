import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS55030Component } from './tls55030.component';

describe('TLS55030Component', () => {
  let component: TLS55030Component;
  let fixture: ComponentFixture<TLS55030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS55030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS55030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
