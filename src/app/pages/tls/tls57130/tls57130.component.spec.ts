import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS57130Component } from './tls57130.component';

describe('TLS57130Component', () => {
  let component: TLS57130Component;
  let fixture: ComponentFixture<TLS57130Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS57130Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS57130Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
