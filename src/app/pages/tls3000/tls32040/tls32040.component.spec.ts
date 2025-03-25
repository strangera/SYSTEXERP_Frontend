import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS32040Component } from './tls32040.component';

describe('TLS32040Component', () => {
  let component: TLS32040Component;
  let fixture: ComponentFixture<TLS32040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS32040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS32040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
