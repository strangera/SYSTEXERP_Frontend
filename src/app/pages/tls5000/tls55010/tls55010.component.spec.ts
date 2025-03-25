import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS55010Component } from './tls55010.component';

describe('TLS55010Component', () => {
  let component: TLS55010Component;
  let fixture: ComponentFixture<TLS55010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS55010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS55010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
