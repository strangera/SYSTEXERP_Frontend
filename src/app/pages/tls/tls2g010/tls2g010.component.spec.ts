import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2G010Component } from './tls2g010.component';

describe('TLS2G010Component', () => {
  let component: TLS2G010Component;
  let fixture: ComponentFixture<TLS2G010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2G010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2G010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
