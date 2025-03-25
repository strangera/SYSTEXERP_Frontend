import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS43010Component } from './tls43010.component';

describe('TLS43010Component', () => {
  let component: TLS43010Component;
  let fixture: ComponentFixture<TLS43010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS43010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS43010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
