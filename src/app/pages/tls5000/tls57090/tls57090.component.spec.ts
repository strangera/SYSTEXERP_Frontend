import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS57090Component } from './tls57090.component';

describe('TLS57090Component', () => {
  let component: TLS57090Component;
  let fixture: ComponentFixture<TLS57090Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS57090Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS57090Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
