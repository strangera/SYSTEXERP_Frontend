import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS53020Component } from './tls53020.component';

describe('TLS53020Component', () => {
  let component: TLS53020Component;
  let fixture: ComponentFixture<TLS53020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS53020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS53020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
