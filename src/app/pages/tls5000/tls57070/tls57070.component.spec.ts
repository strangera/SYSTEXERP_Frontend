import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS57070Component } from './tls57070.component';

describe('TLS57070Component', () => {
  let component: TLS57070Component;
  let fixture: ComponentFixture<TLS57070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS57070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS57070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
