import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS57150Component } from './tls57150.component';

describe('TLS57150Component', () => {
  let component: TLS57150Component;
  let fixture: ComponentFixture<TLS57150Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS57150Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS57150Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
