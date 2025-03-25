import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS26010Component } from './tls26010.component';

describe('TLS26010Component', () => {
  let component: TLS26010Component;
  let fixture: ComponentFixture<TLS26010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS26010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS26010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
