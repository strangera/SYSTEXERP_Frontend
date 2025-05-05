import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS43040Component } from './tls43040.component';

describe('TLS43040Component', () => {
  let component: TLS43040Component;
  let fixture: ComponentFixture<TLS43040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS43040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS43040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
