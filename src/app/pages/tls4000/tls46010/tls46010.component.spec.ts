import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS46010Component } from './tls46010.component';

describe('TLS46010Component', () => {
  let component: TLS46010Component;
  let fixture: ComponentFixture<TLS46010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS46010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS46010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
