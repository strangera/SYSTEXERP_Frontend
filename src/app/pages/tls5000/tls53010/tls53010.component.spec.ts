import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS53010Component } from './tls53010.component';

describe('TLS53010Component', () => {
  let component: TLS53010Component;
  let fixture: ComponentFixture<TLS53010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS53010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS53010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
