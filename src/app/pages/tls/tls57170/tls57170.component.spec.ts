import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS57170Component } from './tls57170.component';

describe('TLS57170Component', () => {
  let component: TLS57170Component;
  let fixture: ComponentFixture<TLS57170Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS57170Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS57170Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
