import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS57140Component } from './tls57140.component';

describe('TLS57140Component', () => {
  let component: TLS57140Component;
  let fixture: ComponentFixture<TLS57140Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS57140Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS57140Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
