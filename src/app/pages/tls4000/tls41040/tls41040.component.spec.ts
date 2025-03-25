import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS41040Component } from './tls41040.component';

describe('TLS41040Component', () => {
  let component: TLS41040Component;
  let fixture: ComponentFixture<TLS41040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS41040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS41040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
