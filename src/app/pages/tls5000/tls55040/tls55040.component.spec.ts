import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS55040Component } from './tls55040.component';

describe('TLS55040Component', () => {
  let component: TLS55040Component;
  let fixture: ComponentFixture<TLS55040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS55040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS55040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
