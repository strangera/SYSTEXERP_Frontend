import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS43050Component } from './tls43050.component';

describe('TLS43050Component', () => {
  let component: TLS43050Component;
  let fixture: ComponentFixture<TLS43050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS43050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS43050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
