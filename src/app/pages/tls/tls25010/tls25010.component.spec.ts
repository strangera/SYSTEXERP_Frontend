import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS25010Component } from './tls25010.component';

describe('TLS25010Component', () => {
  let component: TLS25010Component;
  let fixture: ComponentFixture<TLS25010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS25010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS25010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
