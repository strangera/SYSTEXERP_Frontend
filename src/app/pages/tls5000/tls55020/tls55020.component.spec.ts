import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS55020Component } from './tls55020.component';

describe('TLS55020Component', () => {
  let component: TLS55020Component;
  let fixture: ComponentFixture<TLS55020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS55020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS55020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
