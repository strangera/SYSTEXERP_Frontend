import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS43030Component } from './tls43030.component';

describe('TLS43030Component', () => {
  let component: TLS43030Component;
  let fixture: ComponentFixture<TLS43030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS43030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS43030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
