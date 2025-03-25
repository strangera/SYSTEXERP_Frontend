import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS41010Component } from './tls41010.component';

describe('TLS41010Component', () => {
  let component: TLS41010Component;
  let fixture: ComponentFixture<TLS41010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS41010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS41010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
