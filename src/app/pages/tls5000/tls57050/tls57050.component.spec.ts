import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS57050Component } from './tls57050.component';

describe('TLS57050Component', () => {
  let component: TLS57050Component;
  let fixture: ComponentFixture<TLS57050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS57050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS57050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
