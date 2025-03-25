import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2B010Component } from './tls2b010.component';

describe('TLS2B010Component', () => {
  let component: TLS2B010Component;
  let fixture: ComponentFixture<TLS2B010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2B010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2B010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
