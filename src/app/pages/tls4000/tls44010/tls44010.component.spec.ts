import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS44010Component } from './tls44010.component';

describe('TLS44010Component', () => {
  let component: TLS44010Component;
  let fixture: ComponentFixture<TLS44010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS44010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS44010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
