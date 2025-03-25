import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS53040Component } from './tls53040.component';

describe('TLS53040Component', () => {
  let component: TLS53040Component;
  let fixture: ComponentFixture<TLS53040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS53040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS53040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
