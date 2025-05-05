import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS28040Component } from './tls28040.component';

describe('TLS28040Component', () => {
  let component: TLS28040Component;
  let fixture: ComponentFixture<TLS28040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS28040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS28040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
