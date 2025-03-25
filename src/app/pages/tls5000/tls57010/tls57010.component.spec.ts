import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS57010Component } from './tls57010.component';

describe('TLS57010Component', () => {
  let component: TLS57010Component;
  let fixture: ComponentFixture<TLS57010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS57010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS57010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
