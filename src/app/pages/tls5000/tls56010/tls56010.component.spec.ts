import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS56010Component } from './tls56010.component';

describe('TLS56010Component', () => {
  let component: TLS56010Component;
  let fixture: ComponentFixture<TLS56010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS56010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS56010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
